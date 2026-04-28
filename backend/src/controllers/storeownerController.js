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

module.exports = { ViewSalesReport, viewCustomerInsights }