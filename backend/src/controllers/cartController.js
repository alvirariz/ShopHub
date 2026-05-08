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
const addItemToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // GUEST USER - No userId provided
    if (!userId) {
      // Just validate that product exists
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) }
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      // Return success - frontend will store in localStorage
      return res.status(200).json({ 
        message: "Item ready to add to cart",
        product,
        quantity
      });
    }

    // LOGGED IN USER - Has userId
    let cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: parseInt(userId) }
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId)
      }
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });

      return res.status(200).json({ 
        message: "Cart updated", 
        cartItem: updatedItem 
      });
    }

    // Add new item
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parseInt(productId),
        quantity
      }
    });

    res.status(201).json({ 
      message: "Item added to cart", 
      cartItem 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Failed to add item to cart", 
      error: error.message 
    });
  }
};


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
const mergeGuestCart = async (req, res) => {
  const { userId, guestCartItems } = req.body; // guestCartItems from localStorage

  try {
    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
      include: { cartItems: true }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: parseInt(userId) }
      });
    }

    // Merge guest items with existing cart
    for (const guestItem of guestCartItems) {
      const existingItem = cart.cartItems.find(
        item => item.productId === guestItem.productId
      );

      if (existingItem) {
        // Update quantity if item already exists
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: existingItem.quantity + guestItem.quantity 
          }
        });
      } else {
        // Add new item to cart
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity
          }
        });
      }
    }

    // Get updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
      include: { 
        cartItems: {
          include: { product: true }
        }
      }
    });

    res.status(200).json({ 
      message: "Guest cart merged successfully", 
      cart: updatedCart 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Failed to merge cart", 
      error: error.message 
    });
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
    removeItemFromCart,
    mergeGuestCart
};