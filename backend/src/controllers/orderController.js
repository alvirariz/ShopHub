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


// checkout 
const checkout = async (req, res) => {
    try{
        const {userId, shippingAddress, shippingMethod} = req.body;

        // verify that user exists 
        const user = await prisma.user.findUnique({where:{id:userId}});
        if(!user){ 
            return res.status(401).json({message:'User not found. Please log in to continue to checkout'});
        }

        // get user's cart
        const cart = await prisma.cart.findUnique({
            where:{userId}, 
            include:{cartItems:{include:{product:true}}}
        });
        if(!cart || cart.cartItems.length === 0){
            return res.status(400).json({message:'Cart is empty'});
        }

        // verify stock availability for all items 
        for(const item of cart.cartItems){
            if(item.product.isDeleted || item.product.isWithdrawn){
                return res.status(400).json({message: `Product ${item.product.name} is no longer available`});
            }
            if(item.product.stock < item.quantity){
                return res.status(400).json({message:`Insufficient stock for ${item.product.name}`});
            }
        }

        //calculate total 
        const total = cart.cartItems.reduce((sum, item)=>{
            return sum + (item.quantity*item.product.price);
        }, 0);

        // create order 
        const order = await prisma.order.create({
            data:{
                customerId: userId, 
                shippingAddress,
                shippingMethod,
                total, 
                status: 'pending', 
                items:{
                    create: cart.cartItems.map(item=>({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }))
                }
            }, 
            include:{items:true}
        });

        // reduce stock for each product 
        for(const item of cart.cartItems){
            await prisma.product.update({
                where:{id: item.productId},
                data:{stock: item.product.stock - item.quantity}
            });
        }

        // clear the cart 
        await prisma.cartItem.deleteMany({where:{cartId: cart.id}});

        // create notification for the customer
        await prisma.Notification.create({
            data: {
                message: `Your order #${order.id} has been placed successfully!`,
                type: 'order',
                userId: userId
            }
        });

        //return order confirmation 
        res.status(201).json({
            message:'Order placed successfully', 
            order
        });

    }
    catch(error){
        res.status(500).json({message:'Checkout failed', error: error.message});
    }
}


const updateOrderStatus = async(req,ans) =>
{
    try
    {
        const {orderId}=req.params
        const {newStatus}=req.body
        const order = await prisma.order.findUnique
        ({
            where: { id: parseInt(orderId) }
        })

        if(!order)
        {
            return ans.status(404).json({ message: "Order not found" })
        }

        const validStatuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered']

        const currentIndex = validStatuses.indexOf(order.status)
        const newIndex = validStatuses.indexOf(newStatus)

        if(newIndex !== currentIndex + 1) 
        {
            return ans.status(400).json({ message: "Invalid status transition. Cannot skip a transition " })
        }

        const updated = await prisma.order.update
        ({
            where: { id: parseInt(orderId) },
            data: { status: newStatus }
        })

        return ans.json({ message: "Order status updated successfully", order: updated })

    }
     catch(error)
  {
    ans.status(500).json({ message: "something went wrong", error: error.message })
  }
}


// view order history 
const viewOrderHistory = async(req, res) => {
    try{
        const {userId} = req.params; 

        // verify that user exists
        const user = await prisma.user.findUnique({where:{id:parseInt(userId)}});
        if(!user){
            return res.status(404).json({message:'User not found'});
        }

        // get user's orders
        const orders = await prisma.order.findMany({
            where:{customerId:parseInt(userId)}, 
            include:{items:{include:{product:true}}},
            orderBy:{createdAt:'desc'}
        });

        // if no orders found 
        if(orders.length === 0){
            return res.status(200).json({message:'No orders found'});
        }

        // successful retrievall 
        res.status(200).json({
            message:'Order history retrieved successfully', 
            count: orders.length,
            orders
        });
    }
    catch(error){
        res.status(500).json({message: 'Error fetching order history', error: error.message});
    }
}


// track order status 
const trackOrderStatus = async(req, res) => {
    try{
        const {orderId} = req.params;

        //get order record 
        const order = await prisma.order.findUnique({
            where:{id: parseInt(orderId)}, 
            include:{items:{include:{product:true}}}
        });

        if(!order){return res.status(404).json({message:'Order not found'});}

        //display fulfillment status 
        const fulfillmentStatus = {
            orderId: order.id,
            status: order.status,
            shippingMethod: order.shippingMethod,
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt
        };

        //check if tracking available 
        const trackingAvailable = ['shipped', 'delivered'].includes(order.status);

        if(!trackingAvailable){
            return res.status(200).json({
                message: 'Tracking is not available yet',
                fulfillmentStatus, 
                trackingInfo: 'Your order is being processed. Please check back later for tracking details.'
            });
        }

        // return details 
        res.status(200).json({
            message: 'Tracking information retrieved successfully',
            fulfillmentStatus, 
            trackingInfo: {
                status: order.status,
                shippingMethod: order.shippingMethod,
                shippingAddress: order.shippingAddress,
                estimatedDelivery: new Date(order.createdAt.getTime() + 7*24*60*60*1000) // estimated delivery in 7 days
            }
        });

    }
    catch(error){
        res.status(500).json({message: 'Error tracking order status', error: error.message});
    }
}

// cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: { items: { include: { product: true } } }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: "Only pending orders can be cancelled." });
        }

        // Restore stock
        for (const item of order.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: item.product.stock + item.quantity }
            });
        }

        // Update status
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(orderId) },
            data: { status: 'cancelled' }
        });

        // Notify user
        await prisma.Notification.create({
            data: {
                message: `Your order #${order.id} has been cancelled successfully.`,
                type: 'order',
                userId: order.customerId
            }
        });

        res.status(200).json({ message: "Order cancelled successfully", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling order", error: error.message });
    }
}

module.exports = { viewIncomingOrders,viewSpecificOrders, checkout, viewOrderHistory, trackOrderStatus, updateOrderStatus, cancelOrder }