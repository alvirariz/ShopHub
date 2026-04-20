const express = require('express');
const router = express.Router();


const {
 viewIncomingOrders,
 viewSpecificOrders, 
 checkout, 
 viewOrderHistory,
 trackOrderStatus
} = require('../controllers/orderController');

// Compare products
router.get('/view', viewIncomingOrders);
router.get('/history/:userId', viewOrderHistory);
router.get('/track/:orderId', trackOrderStatus);
router.post('/checkout', checkout);
router.get('/:orderId', viewSpecificOrders );
module.exports = router
