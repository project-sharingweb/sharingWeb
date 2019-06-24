const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller')
const secure = require('../middlewares/secure.mid')

router.get('/', shopController.list)
router.get('/:name', shopController.shopDetail)

router.get('/:name/products', shopController.productsList)
router.get('/:name/products/:id', shopController.productDetail)
router.post('/addproduct', secure.isAuthenticated, shopController.addProduct)


router.get('/:name/orders', secure.isAuthenticated, shopController.ordersList)
router.get('/:name/orders/:id', secure.isAuthenticated, shopController.ordersDetail)
router.post('/:name/purchase', shopController.purchase)



module.exports = router;
