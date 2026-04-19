//productRoutes
const express = require('express');
const router = express.Router();

const {
    withdrawProduct, 
    compareProducts,
    updateStockQuantity,
    viewLowStockAlerts
} = require('../controllers/productController');

// Compare products
router.get('/compare', compareProducts);


//withdraw product listing 
router.put('/:productId/withdraw',withdrawProduct)

//UC:30 update stock quantity
router.put('/:productId/stock',updateStockQuantity)
//uc:31 view low stock quantity
router.get('/low-stock', viewLowStockAlerts)

module.exports=router
