const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const middleware = require('../middleware/middleware')


//test-api
router.get('/test-me', function(req, res) {
    res.send({ status: true, message: "test-api working fine" })
})

//*********************************USER API************************************************** */
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.login)
router.get("/user/:userId/profile",middleware.authentication, UserController.getUser)
router.put("/user/:userId/profile",middleware.authentication, UserController.updateUser)


module.exports = router