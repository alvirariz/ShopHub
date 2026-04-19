//productRoutes
const express = require('express');
const router = express.Router();

const {
    withdrawProduct, 
    compareProducts,
    updateStockQuantity
} = require('../controllers/productController');

// Compare products
router.get('/compare', compareProducts);


//withdraw product listing 
router.put('/:productId/withdraw',withdrawProduct)

//UC:30 update stock qunatity
router.put('/:productId/stock',updateStockQuantity)

module.exports=router
