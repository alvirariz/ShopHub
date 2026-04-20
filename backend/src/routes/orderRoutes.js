const express = require('express');
const router = express.Router();


const {
 viewIncomingOrders,
 viewSpecificOrders,
 updateOrderStatus
} = require('../controllers/orderController');

// Compare products
router.get('/view', viewIncomingOrders);
router.get('/:orderId', viewSpecificOrders );
//update order status
router.put('/:orderId/status', updateOrderStatus)

module.exports = router
