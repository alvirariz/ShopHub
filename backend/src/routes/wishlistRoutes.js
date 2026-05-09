const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/roleMiddleware');

const { 
    addToWishlist, 
    removeFromWishlist, 
    getWishlist 
} = require('../controllers/wishlistController');

// All wishlist routes require customer authentication
router.get('/:userId', authenticate, isCustomer, getWishlist);                      // View wishlist
router.post('/', authenticate, isCustomer, addToWishlist);                          // UC-09: Add Product to Wishlist
router.delete('/item/:productId', authenticate, isCustomer, removeFromWishlist);           // UC-10: Remove Product from Wishlist

module.exports = router;