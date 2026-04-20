const express = require('express');
const router = express.Router();
const { writeReview, getProductReviews } = require('../controllers/reviewController');

router.post('/', writeReview);                    // POST /api/reviews
router.get('/:productId', getProductReviews);     // GET  /api/reviews/1

module.exports = router;