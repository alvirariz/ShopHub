const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isStoreOwner } = require('../middleware/roleMiddleware');

const { ViewSalesReport, viewCustomerInsights } = require('../controllers/storeownerController');

// All routes here require authentication AND storeOwner role
router.get('/sales', authenticate, isStoreOwner, ViewSalesReport);
router.get('/insights', authenticate, isStoreOwner, viewCustomerInsights);

module.exports = router;