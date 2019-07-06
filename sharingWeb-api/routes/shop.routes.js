const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller')
const secure = require('../middlewares/secure.mid')
const storage = require('../config/storage.config');

router.get('/', shopController.list)
router.get('/:name', shopController.shopDetail)
router.put('/:name', 
  secure.isAuthenticated,
  secure.ownedByUser, 
  storage.fields([
    {name: "logo", maxCount: 1},
    {name: "background", maxCount: 1}
  ]), 
  shopController.editShop)

router.get('/:name/products', shopController.productsList)
router.get('/:name/products/:id', shopController.productDetail)
router.post('/:name/products', secure.isAuthenticated, secure.ownedByUser, storage.single('image'), shopController.addProduct)

router.get('/:name/orders', secure.isAuthenticated, secure.ownedByUser, shopController.ordersList)
router.get('/:name/orders/:id', secure.isAuthenticated, secure.ownedByUser, shopController.ordersDetail)
router.post('/:name/orders', shopController.purchase)

module.exports = router;
