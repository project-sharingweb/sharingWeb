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
router.post('/:name/products/delete', secure.isAuthenticated, secure.ownedByUser, shopController.deleteProduct)
router.post('/:name/products', secure.isAuthenticated, secure.ownedByUser, storage.single('image'), shopController.addProduct)
router.get('/:name/products/:id', shopController.productDetail)

router.get('/:name/orders', shopController.ordersList)
router.post('/:name/orders', shopController.purchase)
router.get('/:name/orders/:id/modify', shopController.confirmPayment)
router.get('/:name/orders/:id', secure.isAuthenticated, secure.ownedByUser, shopController.ordersDetail)
router.post('/:name/orders/:id', secure.isAuthenticated, secure.ownedByUser, shopController.editOrder)


module.exports = router;
