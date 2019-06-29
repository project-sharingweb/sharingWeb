const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')
const secure = require('../middlewares/secure.mid')
const storage = require('../config/storage.config');
const passport = require('passport')


/* GET home page. */
router.post('/register', authController.register)
router.put('/editshop', secure.isAuthenticated, storage.single('image'), authController.editShop)

router.post('/login', authController.login)

router.get('/authenticate/google', passport.authenticate('google-auth', { scope: ['openid', 'profile', 'email']}))
router.get('/auth/:idp/cb', authController.loginWithIDPCallback);

router.get('/logout', authController.logout)


module.exports = router;
