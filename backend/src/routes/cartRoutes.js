const express = require('express');
const router = express.Router();

const { 
    getCartByUserId, 
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart
} = require('../controllers/cartController');



// Get Cart By User ID
router.get('/:userId', getCartByUserId);
router.post('/', addItemToCart);
router.patch('/item/:id', updateCartItemQuantity); // patch since only updating quantity not whole item
router.delete('/item/:id', removeItemFromCart); // delete to remove item from cart
module.exports = router;