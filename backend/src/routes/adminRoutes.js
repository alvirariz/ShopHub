const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Import controllers
const { 
  manageUserStatus, 
  getPlatformMetrics,
  getPendingApplications, 
  getApplicationById, 
  manageApplication, 
  searchUsers,
  getUserDetails
} = require('../controllers/adminController');

// All routes require authentication + admin role
router.get('/metrics', authenticate, isAdmin, getPlatformMetrics);                          // UC-24: Monitor Platform Activity
router.get('/users/:userId', authenticate, isAdmin, getUserDetails);                        // Get user details
router.patch('/users/:userId/status', authenticate, isAdmin, manageUserStatus);             // UC-23: Manage User Account Status
router.get('/applications', authenticate, isAdmin, getPendingApplications);                 // UC-11: Review Store Applications             
router.get('/applications/:applicationId', authenticate, isAdmin, getApplicationById);      // Helper: Get application details by id
router.patch('/applications/:applicationId', authenticate, isAdmin, manageApplication);     // UC-12: Manage Store Applications    
router.get('/users', authenticate, isAdmin, searchUsers);                                   // UC-13: Search User Accounts 

module.exports = router;