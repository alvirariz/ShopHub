const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ViewSalesReport = async(req,ans) =>
{
    try
    {
        const { period } = req.query;
        const storeOwnerId = req.user.id;
        
        let now = new Date();
        let startDate = new Date();

        if(period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
        } else if(period === 'monthly') {
            startDate.setDate(startDate.getDate() - 30);
        } else if(period === 'custom') {
            startDate = new Date(req.query.startDate);
            now = new Date(req.query.endDate);
        } else {
            startDate.setDate(startDate.getDate() - 30);
        }

        const allOrders = await prisma.order.findMany({
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
                        product: true  
                    }
                } 
            }
        });

        // Filter orders to only those that contain products from this store owner
        const storeOrders = allOrders.filter(order => 
            order.items.some(item => item.product.storeId === storeOwnerId)
        );

        const totalOrders = storeOrders.length;
        
        // Only sum up revenue from items belonging to this store owner
        const totalRevenue = storeOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => {
                if (item.product.storeId === storeOwnerId) {
                    return itemSum + (item.quantity * item.product.price);
                }
                return itemSum;
            }, 0);
        }, 0);

        return ans.json({
            message: "Sales report",
            period: period || 'monthly',
            totalOrders,
            totalRevenue,
            orders: storeOrders
        });
    }
    catch(error) 
    {
        ans.status(500).json({ message: "something went wrong", error: error.message });
    }
}

const viewCustomerInsights = async (req, ans) => {
  try {
    const { period } = req.query
    const storeOwnerId = req.user.id;

    let now = new Date()
    let startDate = new Date()

    if(period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7)
    } else if(period === 'monthly') {
      startDate.setDate(startDate.getDate() - 30)
    } else {
      startDate.setDate(startDate.getDate() - 30)
    }

    // get all orders in period that belong to this store
    const allOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: now } 
      },
      include: {
        items: { include: { product: true } }
      }
    })

    const storeOrders = allOrders.filter(order => 
      order.items.some(item => item.product.storeId === storeOwnerId)
    );

    // returning obj that counts how many orders each customer made
    const customerOrderCounts = {}
    storeOrders.forEach(order => {
      customerOrderCounts[order.customerId] = 
      (customerOrderCounts[order.customerId] || 0) + 1
    })

    const returningCustomers = Object.values(customerOrderCounts)
      .filter(count => count > 1).length 
    const newCustomers = Object.values(customerOrderCounts)
      .filter(count => count === 1).length 

    // Find top products for this store owner
    const storeProducts = await prisma.product.findMany({
      where: { storeId: storeOwnerId },
      select: { id: true, name: true }
    });
    
    const storeProductIds = storeProducts.map(p => p.id);

    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: storeProductIds },
        order: { createdAt: { gte: startDate, lte: now } }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProducts = topProductsRaw.map(tp => ({
      productId: tp.productId,
      sold: tp._sum.quantity,
      name: storeProducts.find(p => p.id === tp.productId)?.name || 'Unknown'
    }));

    const topProduct = topProducts.length > 0 ? topProducts[0] : null;

    return ans.json({
      message: "Customer insights",
      period: period || 'monthly',
      topProduct,
      topProducts,
      returningCustomers,
      newCustomers,
      totalCustomers: Object.keys(customerOrderCounts).length
    })

  } catch(error) {
    ans.status(500).json({ message: "something went wrong", error: error.message })
  }
}

module.exports = { ViewSalesReport, viewCustomerInsights }