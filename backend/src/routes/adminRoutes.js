
const express = require('express')

const router = express.Router()

const { manageUserStatus, getPlatformMetrics } = require('../controllers/adminController');
const { getPendingApplications, getApplicationById, manageApplication, searchUsers } = require('../controllers/adminController')


router.get('/metrics', getPlatformMetrics);
router.patch('/users/:userId/status', manageUserStatus);
router.get('/applications', getPendingApplications)// UC:11 Review Store Applications             
router.get('/applications/:applicationId', getApplicationById)  // helper function to get application details by id for admin review page
router.patch('/applications/:applicationId', manageApplication) //UC:12 Manage Store Applications    
router.get('/users', searchUsers)   // UC:13 Search Users Accounts 


module.exports = router

