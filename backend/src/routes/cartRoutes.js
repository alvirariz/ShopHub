const express = require('express');
const router = express.Router();

const { 
    getCartByUserId 
} = require('../controllers/cartController');



// Get Cart By User ID
router.get('/:userId', getCartByUserId);
module.exports = router;