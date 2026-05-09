const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isCustomer, isStoreOwner } = require('../middleware/roleMiddleware');

const {
    viewIncomingOrders,
    viewSpecificOrders, 
    checkout, 
    viewOrderHistory,
    trackOrderStatus,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');

// Customer routes
router.post('/checkout', authenticate, isCustomer, checkout);                       // UC-18: Checkout
router.get('/history/:userId', authenticate, isCustomer, viewOrderHistory);         // UC-19: View Order History
router.get('/track/:orderId', authenticate, isCustomer, trackOrderStatus);          // UC-20: Track Order Status
router.put('/:orderId/cancel', authenticate, isCustomer, cancelOrder);              // Cancel Order

// Store owner routes
router.get('/view', authenticate, isStoreOwner, viewIncomingOrders);                // UC-32: View Incoming Orders
router.get('/:orderId', authenticate, isStoreOwner, viewSpecificOrders);            // View specific order details
router.put('/:orderId/status', authenticate, isStoreOwner, updateOrderStatus);      // UC-33: Update Order Status

module.exports = router;