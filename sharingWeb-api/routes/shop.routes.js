const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller')
const secure = require('../middlewares/secure.mid')
const storage = require('../config/storage.config');

router.get('/', shopController.list)
router.get('/:name', shopController.shopDetail)
router.put('/editshop', 
  secure.isAuthenticated, 
  storage.fields([
    {name: "logo", maxCount: 1},
    {name: "background", maxCount: 1}
  ]), 
  shopController.editShop)

router.get('/:name/products', shopController.productsList)
router.get('/:name/products/:id', shopController.productDetail)
router.post('/addproduct', secure.isAuthenticated, storage.single('image'), shopController.addProduct)

router.get('/:name/orders', secure.isAuthenticated, shopController.ordersList)
router.get('/:name/orders/:id', secure.isAuthenticated, shopController.ordersDetail)
router.post('/purchase', shopController.purchase)


module.exports = router;
