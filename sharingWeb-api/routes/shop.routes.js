const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller')
const secure = require('../middlewares/secure.mid')

router.get('/', shopController.shops)

router.get('/:name', shopController.home)

router.get('/:name/products', shopController.products)
router.get('/:name/products/:id', shopController.productDetail)
router.post('/addproduct', secure.isAuthenticated, shopController.addProduct)

router.get('/:name/orders', secure.isAuthenticated, shopController.orders)
router.post('/:name/purchase', shopController.purchase)



module.exports = router;
