const Shop = require('../models/shop.model')
const Product = require('../models/product.model')
const Order = require('../models/order.model')


module.exports.list = (req, res, next) => {

  Shop.find()
    .then(shops => res.status(200).json())
    .catch(next)
}


module.exports.shopDetail = (req, res, next) => {}


module.exports.productsList = (req, res, next) => {}


module.exports.productDetail = (req, res, next) => {}


module.exports.addProduct = (req, res, next) => {}


module.exports.ordersList = (req, res, next) => {}


module.exports.ordersDetail = (req, res, next) => {}


module.exports.purchase = (req, res, next) => {}

