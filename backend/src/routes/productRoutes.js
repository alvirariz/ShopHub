const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isStoreOwner } = require('../middleware/roleMiddleware');

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
    filterProducts,
    getFilterOptions
} = require('../controllers/productController');

// PUBLIC ROUTES (no authentication needed)
router.get('/browse', browseProducts);                      // UC-05: Browse Products
router.get('/search', searchProducts);                      // UC-06: Search Products
router.get('/filter', filterProducts);                      // UC-07: Filter Products
router.get('/filter-options', getFilterOptions);            // Fetch dynamic categories and brands
router.get('/compare', compareProducts);                    // UC-15: Compare Products
router.get('/low-stock', authenticate, isStoreOwner, viewLowStockAlerts);           // UC-31: View Low Stock Alerts
router.get('/:productId', getProductDetails);               // UC-14: View Product Details

// AUTHENTICATED CUSTOMER ROUTES (optional - you can keep these public too)
router.get('/', sortProducts);                              // UC-08: Sort Products

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// STORE OWNER ONLY ROUTES
router.post('/test-upload', upload.single('image'), (req, res) => {
  res.json({ body: req.body, file: req.file });
});
router.post('/', authenticate, isStoreOwner, upload.single('image'), addProduct);                           // UC-27: Add Product
router.put('/:productId', authenticate, isStoreOwner, upload.single('image'), editProduct);                 // UC-28: Edit Product
router.put('/:productId/withdraw', authenticate, isStoreOwner, withdrawProduct);    // UC-29: Withdraw Product Listing
router.put('/:productId/stock', authenticate, isStoreOwner, updateStockQuantity);   // UC-30: Update Stock Quantity

module.exports = router;