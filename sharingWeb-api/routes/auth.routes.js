const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')
const secure = require('../middlewares/secure.mid')


/* GET home page. */
router.post('/register', authController.register)
router.put('/editshop', secure.isAuthenticated, authController.editShop)

router.post('/login', authController.login)

router.get('/logout', authController.logout)


module.exports = router;
