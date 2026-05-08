const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/roleMiddleware');

const { 
    getCartByUserId, 
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    mergeGuestCart  // NEW - for merging guest cart after login
} = require('../controllers/cartController');

// GUEST CART - No authentication required
router.post('/', addItemToCart);                                    // Guest can add to cart
router.patch('/item/:id', updateCartItemQuantity);                  // Guest can update quantity
router.delete('/item/:id', removeItemFromCart);                     // Guest can remove items

// AUTHENTICATED CART - Requires login
router.get('/:userId', authenticate, isCustomer, getCartByUserId);  // View saved cart
router.post('/merge', authenticate, isCustomer, mergeGuestCart);    // Merge guest cart after login

module.exports = router;