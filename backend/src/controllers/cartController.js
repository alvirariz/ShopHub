const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//Get Cart By User ID 
const getCartByUserId = async(req, res) => {
    try {
        const {userId} = req.params; 

        const cart = await prisma.cart.findUnique({
            where: {userId: parseInt(userId)}, 
            include:{
                cartItems: {
                    include: {product: true}
                }
            }
        });

        if(!cart){
            return res.status(404).json({
                message: 'Cart not found for this user'
            });
        }

        res.status(200).json(cart);

    }
    catch(error){
        res.status(500).json({
            message: 'Error fetching cart',
            error: error.message
        })
    }
}

module.exports = {
    getCartByUserId
};