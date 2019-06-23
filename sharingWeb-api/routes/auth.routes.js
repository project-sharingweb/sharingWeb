const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')


/* GET home page. */
router.post('/register', authController.register)

router.post('/login', authController.login)

router.get('/logout', authController.logout)


module.exports = router;
