const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

const { 
    registerCustomer, 
    registerStoreOwner, 
    login, 
    logout 
} = require('../controllers/authController');

// PUBLIC ROUTES (no authentication needed)
router.post('/register-customer', registerCustomer);        
router.post('/register-store-owner', registerStoreOwner); 
router.post('/login', login);                               

// AUTHENTICATED ROUTES (optional - logout can work without auth too)
router.post('/logout', authenticate, logout);               

module.exports = router;