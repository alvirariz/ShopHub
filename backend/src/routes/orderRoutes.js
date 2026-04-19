const express = require('express');
const router = express.Router();


const {
 viewIncomingOrders
} = require('../controllers/orderController');

// Compare products
router.get('/view', viewIncomingOrders);
module.exports = router
