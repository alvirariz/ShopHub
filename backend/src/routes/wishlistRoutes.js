const express = require('express');
const router = express.Router();
 
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
 
    
router.post('/', addToWishlist) ;      // for adding to wishlist               
router.delete('/:productId', removeFromWishlist); // for removing from wishlsit  
router.get('/user/:userId', getWishlist);   // for user complete wishlist --helper func 



module.exports = router;