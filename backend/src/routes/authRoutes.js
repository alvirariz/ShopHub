const express = require('express')
const router = express.Router()
const { registerCustomer, registerStoreOwner, login, logout } = require('../controllers/authController')

// uc 1
router.post('/register-customer', registerCustomer)

//uc2
router.post('/register-store-owner', registerStoreOwner)

//uc3
router.post('/login', login)

// uc4
router.post('/logout', logout)

module.exports = router