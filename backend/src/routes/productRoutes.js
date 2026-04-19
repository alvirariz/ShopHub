//productRoutes
const express = require('express');
const router = express.Router();

const {
    withdrawProduct, 
    compareProducts
} = require('../controllers/productController');

// Compare products
router.get('/compare', compareProducts);

//code by lamiya
//the usecase to withdraw product listing 
router.put('/:productId/withdraw',withdrawProduct)

module.exports=router
