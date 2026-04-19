// View Order HistorY 
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


// uc 32 view incoming orders
const viewIncomingOrders = async (req, ans) => {
  try {
    const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }  
})
    if(orders.length === 0) {
      return ans.status(200).json({ message: "No orders" })
    }

    return ans.json({ message: "orders: ", orders: orders })
    
  } 
  
  catch(error) {
    ans.status(500).json({ message: "something went wrong", error: error.message })
  }
}

const viewSpecificOrders = async (req, ans) => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: true }
    })

    if(!order) {
      return ans.status(404).json({ message: "Order not found" })
    }

    return ans.json({ message: "Order found", order: order })

  } 
  catch(error)
  {
    ans.status(500).json({ message: "something went wrong", error: error.message })
  }
}

module.exports = { viewIncomingOrders,viewSpecificOrders }


// Track Order Status 



   