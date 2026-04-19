//productRoutes
const express = require('express');
const router = express.Router();

const {
    withdrawProduct, 
    compareProducts
} = require('../controllers/productController');


// Withdraw or delist a product
//router.patch('/withdraw/:productId', withdrawProduct);

// Compare products
router.get('/compare', compareProducts);

module.exports = router;