const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller')

router.get('/', homeController.shops)

router.get('/:name', shopController.home)

router.get('/:name/products', shopController.products)
router.get('/:name/products/:id', shopController.productDetail)
router.post('/addproduct', shopController.addProduct)

router.get('/:name/orders', shopController.orders)
router.post('/:name/purchase', shopController.purchase)



module.exports = router;
