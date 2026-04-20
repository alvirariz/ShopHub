
const express = require('express')

const router = express.Router()

const { ViewSalesReport } = require('../controllers/adminController')

router.get('/sales', ViewSalesReport)

module.exports = router