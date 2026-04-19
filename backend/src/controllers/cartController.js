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


// Add Item to Cart 
const addItemToCart = async(req, res) => {
    try {
        const {userId, productId, quantity} = req.body; 
        
        //check if product exists and is in stock 
        const product = await prisma.product.findUnique({ where: {id: productId}});
        
        if (!product || product.isDeleted || product.isWithdrawn) {
            return res.status(404).json({message: 'Product not available'});
        }
        if (product.stock < quantity){
            return res.status(400).json({message: 'Insufficient stock'});
        }


        //check if user has a cart 
        let cart = await prisma.cart.findUnique({where: {userId}});
        
        if (!cart){
            cart  = await prisma.cart.create({data: {userId}}); // create if not exist
        }

        
        //check if item was already in cart 
        const existingItem = await prisma.cartItem.findFirst({where: {cartId: cart.id, productId}});
        
        if (existingItem){
            const updated = await prisma.cartItem.update({ // update quantity if yes 
                where: {id: existingItem.id},
                data: {quantity: existingItem.quantity + quantity}
            });
            return res.status(200).json(updated);
        }

        const cartItem = await prisma.cartItem.create({ // otherwise create a new cart item 
            data:{cartId: cart.id, productId, quantity}
        });

        res.status(201).json({cartItem}); // 201 - success code for POST, added to db 
    }
    catch (error){
        res.status(500).json({message: 'Error adding item to cart', error});
    }
}


// Update Cart Item Quantity
const updateCartItemQuantity = async(req, res) => {
    try{
        const {id} = req.params; // cart item id
        const {quantity} = req.body;

        if (quantity <= 0){
            await prisma.cartItem.delete({where: {id: parseInt(id)}});
            return res.status(200).json({message: 'Cart item removed'});
        }

        const updatedItem = await prisma.cartItem.update({
            where: {id: parseInt(id)},
            data: {quantity}
        });
        res.status(200).json(updatedItem);
    }
    catch(error){
        res.status(500).json({message: 'Error updating cart item quantity', error});
    }
}

// remove item from cart 
const removeItemFromCart = async(req, res) => {
    try {
        const {id} = req.params; // cart item id

        await prisma.cartItem.delete({where: {id: parseInt(id)}});
        res.status(200).json({message: 'Cart item removed'});
    }
    catch (error){
        res.status(500).json({message: 'Error removing item from cart', error});
    }
}



module.exports = {
    getCartByUserId, 
    addItemToCart, 
    updateCartItemQuantity, 
    removeItemFromCart
};