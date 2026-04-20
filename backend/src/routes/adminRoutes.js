
const express = require('express')

const router = express.Router()

const { ViewSalesReport,viewCustomerInsights } = require('../controllers/adminController')

router.get('/sales', ViewSalesReport)
router.get('/insights', viewCustomerInsights)
module.exports = router

