const express = require('express');
const router = express.Router();


const {
 viewIncomingOrders,
 viewSpecificOrders
} = require('../controllers/orderController');

// Compare products
router.get('/view', viewIncomingOrders);
router.get('/:orderId', viewSpecificOrders );
module.exports = router
