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

// Reviewing pending applications 
const getPendingApplications = async (req, res) => {
try {
    // applications waiting for admin review
    const applications = await prisma.storeApplication.findMany({
        where: {status: 'pending'},
        orderBy: { createdAt: 'desc'}
    })
    if (applications.length === 0) {
        return res.status(200).json({ message: "No pending applications" })
    }
    return res.json({ applications });
}
catch(error){
     res.status(500).json({message: "Error fetching pending applications",error: error.message});
}

};

// Get an application by Id 
const getApplicationById = async (req , res ) => {
    try{
        const { applicationId } = req.params // id of the application to review
        const application = await prisma.storeApplication.findUnique({
            where: { id: parseInt(applicationId) }
        })
        if (!application) {
            return res.status(404).json({ message: "Application not found" })
        }
        res.status(200).json( application)

    }
    catch(error)
    {
        res.status(500).json({message: "Error fetching application",error: error.message});
    }
};

// Manage store application 
const manageApplication = async (req, res) => {
   try{
    const { applicationId } = req.params
    const { action, rejectReason } = req.body  

    // finding the application 
    const application = await prisma.storeApplication.findUnique({
        where: { id: parseInt(applicationId) }
    })
    if(!application)
    {return res.status(404).json({message: "Application not found"})}

    //  approval of application
    if(action === 'approve')
    {const updates = await prisma.storeApplication.update({
        where: { id: parseInt(applicationId) },
        data: { status: 'approved' }
    })
    return res.json({message: "Application approved", application: updates})
    }

    // rejection of application 
    if(action === 'reject')
    {
        const updates = await prisma.storeApplication.update({
            where:{ id: parseInt(applicationId) },
            data: { status: 'rejected',rejectReason}
        })
        return res.json({message: "Application rejected", application: updates})
    }
    res.status(400).json({message: "Invalid action!\nUse 'approve' or 'reject'"})
   }
   catch(error){
    res.status(500).json({message: "Error managing application",error: error.message});
   }


};

// Search Users 
const searchUsers = async (req , res ) =>
{
  try{

    const { q } = req.query // search query 
        const users = await prisma.user.findMany({
            where: q ? {
                OR: [
                    { name: { contains: q } },    // search by name
                    { email: { contains: q } }    // or by email
                ]
            } : {},   
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                isSuspended: true,
                createdAt: true
                 
            }
        })
 
        if (users.length === 0) 
        {
            return res.status(200).json({ message: 'No users found matching your search' })
        }
 
        res.status(200).json({ count: users.length, users })

  }
  catch(error){
    res.status(500).json({message: "Error searching users",error: error.message});
  }

};



module.exports = { ViewSalesReport, viewCustomerInsights, manageUserStatus,getPlatformMetrics, getPendingApplications, getApplicationById, manageApplication, searchUsers }