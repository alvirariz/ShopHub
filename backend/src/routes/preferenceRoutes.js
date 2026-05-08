const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/roleMiddleware');

const { savePreferences, getRecommendations } = require('../controllers/preferenceController');

// Only customers have preferences
router.post('/:userId', authenticate, isCustomer, savePreferences);                 // UC-25: Complete Preference Questionnaire
router.get('/:userId/recommendations', authenticate, isCustomer, getRecommendations); // UC-26: View Personalized Recommendations

module.exports = router;