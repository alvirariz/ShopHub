const express = require('express');
const router = express.Router();
const { savePreferences, getRecommendations } = require('../controllers/preferenceController');

// UC-25: Save preferences
router.post('/:userId', savePreferences);

// UC-26: Get recommendations
router.get('/:userId/recommendations', getRecommendations);

module.exports = router;