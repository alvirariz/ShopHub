
const express = require('express')

const router = express.Router()

const { ViewSalesReport,viewCustomerInsights } = require('../controllers/adminController')
const { manageUserStatus } = require('../controllers/adminController');

// Simple route - anyone can access (FOR TESTING ONLY)
router.patch('/users/:userId/status', manageUserStatus);
router.get('/sales', ViewSalesReport)
router.get('/insights', viewCustomerInsights)



module.exports = router

