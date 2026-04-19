//productRoutes

//code by lamiya
//the usecase to withdraw product listing 

const express = require('express')
const router = express.Router()

const{withdrawProduct}= require('../controllers/productController') 
router.put('/:productId/withdraw',withdrawProduct)


module.exports=router