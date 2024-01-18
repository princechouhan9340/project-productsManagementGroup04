const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const productController = require('../controllers/productController')
const middleware = require('../middleware/middleware')
const cartController = require("../controllers/cartController")
const orderController = require('../controllers/orderController')
const otp = require('../middleware/otp')

//test-api
router.get('/test', function(req, res) {
    res.send({ status: true, message: "test-api working fine" })
})

//*********************************USERS APIS*********************************************/
router.post('/register', UserController.userRegistration)
router.post('/login',UserController.login)
router.post('/otp',otp.validateOtp)
router.get("/user/:userId/profile",middleware.authentication,UserController.getUser)
router.put("/user/:userId/profile",middleware.authentication, UserController.updateUser) // pass in json


//**********************************PRODUCTS APIS****************************************/
router.post('/products',productController.createProduct)
router.get('/products',productController.getProduct)
router.get('/products/:productId',productController.getProductById)
router.put('/products/:productId',productController.updateProductDetails)
router.delete('/products/:productId',productController.delProduct)


//************************************CARTS APIS****************************************/
router.post('/users/:userId/cart',middleware.authentication,cartController.AddProductToCart)
router.get('/users/:userId/cart',middleware.authentication,cartController.getCart)
router.put('/users/:userId/cart',middleware.authentication,cartController.updateCart)
router.delete('/users/:userId/cart',middleware.authentication,cartController.delCart)

//************************************ORDERS APIS****************************************/
router.post('/users/:userId/orders',middleware.authentication,orderController.createOrder)
router.get('/users/:userId/orders',orderController.getOrder)
router.post('/users/:orderId/payment',orderController.createPaymentorder)
router.post('/users/verification',orderController.paymentverification)
router.put('/users/:userId/orders',middleware.authentication,orderController.changeStatus)

module.exports = router