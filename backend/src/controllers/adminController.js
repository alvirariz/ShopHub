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

module.exports = { ViewSalesReport }