const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const prodectController = require('../controllers/productController')
const middleware = require('../middleware/middleware')


//test-api
router.get('/test-me', function(req, res) {
    res.send({ status: true, message: "test-api working fine" })
})

//*********************************USER API*********************************************/
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.login)
router.get("/user/:userId/profile",middleware.authentication, UserController.getUser)
router.put("/user/:userId/profile",middleware.authentication, UserController.updateUser)


//**********************************PRODUCT APIS****************************************/
router.post('/products',prodectController.createProduct)
router.get('/products',prodectController.getProduct)
router.get('/products/:productId',prodectController.getProductById)
router.put('/products/:productId',prodectController.updateProductDetails)
router.delete('/products/:productId',prodectController.delProduct)


module.exports = router