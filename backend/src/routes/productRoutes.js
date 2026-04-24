//productRoutes
const express = require('express');
const router = express.Router();

const {
    withdrawProduct, 
    compareProducts,
    updateStockQuantity,
    viewLowStockAlerts,
    addProduct,
    editProduct,
    sortProducts,
    getProductDetails,
    browseProducts,
    searchProducts,
    filterProducts
} = require('../controllers/productController');
// Compare products
router.get('/compare', compareProducts);

//add productss
router.post('/', addProduct); 
//edit
router.put('/:productId', editProduct);

//withdraw product listing 
router.put('/:productId/withdraw',withdrawProduct)

//UC:30 update stock quantity
router.put('/:productId/stock',updateStockQuantity)
//uc:31 view low stock quantity
router.get('/low-stock', viewLowStockAlerts)

//UC:08 Sort Products 
router.get('/', sortProducts )     

//UC:14 Get Product Details
router.get('/:productId', getProductDetails) 

//uc5 Browse Products
router.get('/browse', browseProducts)
//uc6 Search Products
router.get('/search', searchProducts)
// uc 7 Filter Products
router.get('/filter', filterProducts)

module.exports=router
