const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const ViewSalesReport = async(req,ans) =>
{
    try
    {

    const { period } = req.query
    
    let now = new Date()
    let startDate = new Date()

    if(period === 'weekly')
    {
        startDate.setDate(startDate.getDate() - 7)
    } 
    else if(period === 'monthly') 
    {
        startDate.setDate(startDate.getDate() - 30)
    }
    else if(period === 'custom') 
    {
        startDate = new Date(req.query.startDate)
        now = new Date(req.query.endDate)
    }
    else 
    {
        startDate.setDate(startDate.getDate() - 30) // default = 30 days
    }

const orders = await prisma.order.findMany({
    where: {
        createdAt: {
            gte: startDate,
            lte: now
        },
        status: 'delivered'
    },
    include: { 
        items: {
            include: {
                product: true  // had to include this to get price 
            }
        } 
    }
})
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.quantity * item.product.price)
    }, 0)
}, 0)

    return ans.json
    ({
        message: "Sales report",
        period: period || 'monthly',
        totalOrders,
        totalRevenue,
        orders
    })
        
    }
    catch(error) 
    {
    ans.status(500).json({ message: "something went wrong", error })
  }


}

const viewCustomerInsights = async (req, ans) => {
  try {
    const { period } = req.query
    let now = new Date()
    let startDate = new Date()

    if(period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7)
    } else if(period === 'monthly') {
      startDate.setDate(startDate.getDate() - 30)
    } else {
      startDate.setDate(startDate.getDate() - 30)
    }

    // 5 most ordered products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })

    // get all orders in period 
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: now } 
      }
    })

    // returning obj that counts how many orders each customer made : {1:3,2:4}
    const customerOrderCounts = {}
    orders.forEach(order => {
      customerOrderCounts[order.customerId] = 
      (customerOrderCounts[order.customerId] || 0) + 1
    })

    const returningCustomers = Object.values(customerOrderCounts) // just to get number
      .filter(count => count > 1).length //customer with more that 1 order
    const newCustomers = Object.values(customerOrderCounts)
      .filter(count => count === 1).length // customer with 1 order

    return ans.json({
      message: "Customer insights",
      period: period || 'monthly',
      topProducts,
      returningCustomers,
      newCustomers,
      totalCustomers: Object.keys(customerOrderCounts).length
    })

  } catch(error) {
    ans.status(500).json({ message: "something went wrong", error })
  }
}

const manageUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { action } = req.body;
    
    try {
        // TODO: Later we'll check if req.user.role === 'admin'
        // For now, anyone can do this (testing only!)
        
        const user = await prisma.User.findUnique({   // find user
            where: { id: parseInt(userId) }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (action === "suspend") {
            await prisma.User.update({
                where: { id: parseInt(userId) },
                data: { isSuspended: true }
            });
            return res.json({ message: "User suspended successfully" });
        }
        
        if (action === "reactivate") {
            await prisma.User.update({
                where: { id: parseInt(userId) },
                data: { isSuspended: false }
            });
            return res.json({ message: "User reactivated successfully" });
        }
        
        return res.status(400).json({ 
            message: "Invalid action. Use 'suspend' or 'reactivate'" 
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error managing user status",
            error: error.message
        });
    }
};

const getPlatformMetrics = async (req, res) => {
    try {
        // Basic counts
        const totalUsers = await prisma.User.count();
        const totalOrders = await prisma.Order.count();
        const totalProducts = await prisma.Product.count();
        
        // Total revenue
        const totalRevenue = await prisma.Order.aggregate({
            _sum: { total: true }
        });
        
        // Recent activity (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const recentUsers = await prisma.User.count({
            where: { createdAt: { gte: oneDayAgo } }
        });
        
        const recentOrders = await prisma.Order.count({
            where: { createdAt: { gte: oneDayAgo } }
        });
        
        return res.json({
            metrics: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                recentUsers,
                recentOrders
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching platform metrics",
            error: error.message
        });
    }
};

module.exports = { ViewSalesReport, viewCustomerInsights, manageUserStatus,getPlatformMetrics }