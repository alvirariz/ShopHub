const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/roleMiddleware');

const { writeReview, getProductReviews } = require('../controllers/reviewController');

// Public: anyone can read reviews
router.get('/:productId', getProductReviews);                                       // View product reviews

// Authenticated customers only: write reviews
router.post('/', authenticate, isCustomer, writeReview);                            // UC-21: Write Product Review

module.exports = router;