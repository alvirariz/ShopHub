
const express = require('express')

const router = express.Router()

const { ViewSalesReport,viewCustomerInsights } = require('../controllers/adminController')
const { manageUserStatus, getPlatformMetrics } = require('../controllers/adminController');

router.get('/metrics', getPlatformMetrics);
router.patch('/users/:userId/status', manageUserStatus);
router.get('/sales', ViewSalesReport)
router.get('/insights', viewCustomerInsights)



module.exports = router

