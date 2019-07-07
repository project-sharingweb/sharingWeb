const Shop = require('../models/shop.model')
const Product = require('../models/product.model')
const Order = require('../models/order.model')


module.exports.list = (req, res, next) => {

  Shop.find()
    .then(shops => res.status(200).json(shops))
    .catch(next)
}


module.exports.shopDetail = (req, res, next) => {
  const shopName = req.params.name
  
  Shop.findOne({urlName: shopName})
    .then(shop => res.status(200).json(shop))
    .catch(next)
}


module.exports.productsList = (req, res, next) => {
  const shopName = req.params.name

  Product.find({shopName: shopName})
    .then(products => res.status(200).json(products))
    .catch(next)
}


module.exports.productDetail = (req, res, next) => {
  const productId = req.params.id

  Product.findById(productId)
    .then(product => res.status(200).json(product))
    .catch(next)
}


module.exports.addProduct = (req, res, next) => {

  const product = new Product(req.body)

  product.save()
    .then(product => res.status(201).json(product))
    .catch(next)
}


module.exports.ordersList = (req, res, next) => {
  const shopName = req.params.name

  Order.find({shopName: shopName})
    .then(orders => res.status(200).json(orders))
    .catch(next)

}


module.exports.ordersDetail = (req, res, next) => {
  const orderId = req.params.id

  Order.findById(orderId)
    .then(order => res.status(200).json(order))
    .catch(next)
}


module.exports.purchase = (req, res, next) => {
  const order = new Order(req.body)
  
  var create_payment_json = {
    intent: "sale",
    payer: {
        payment_method: "paypal"
    },
    redirect_urls: {
        return_url: "http://return.url",
        cancel_url: "http://cancel.url"
    },
    transactions: [{
        item_list: {
            items: [{
                name: "item",
                sku: "item",
                price: "1.00",
                currency: "USD",
                quantity: 1
            }]
        },
        amount: {
            currency: "EUR",
            total: "1.00"
        },
        description: "Articles at Tienda Modelo"
    }]
  };
  
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        console.log("Create Payment Response");
        console.log(payment);
    }
  });

  order.save()
    .then(order => res.status(201).json(order))
    .catch(next)
}

module.exports.editShop = (req, res, next) => {
  const shop = req.body
  delete shop.email
  delete shop.password
  delete shop.name

  const { name } = req.user
/*
  if (req.files) {
    req.body.shop.styles.logo = req.file.secure_url;
    req.body.shop.styles.landingImage.backgroundImage = `url(${req.file.secure_url})`
  }
  */
 if (shop.styles.landingImage.backgroundImage) shop.styles.landingImage.backgroundImage = `url(${shop.styles.landingImage.backgroundImage})`

  Shop.findOneAndUpdate({name: name}, { $set: shop}, { new: true, runValidators: true})
    .then(shop => {
      if (shop) res.json(shop)
      else createError(404, 'shop not found')
    })
    .catch(next)
}
