const Shop = require('../models/shop.model')
const Product = require('../models/product.model')
const Order = require('../models/order.model')
const paypal = require('paypal-rest-sdk')
const nodemailer = require('nodemailer');
const user = process.env.MAIL_USER
const pass = process.env.MAIL_PASS


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

module.exports.deleteProduct = (req, res, next) => {
  const product = req.body
  console.log(product.id)

  Product.findByIdAndDelete(product.id)
    .then(product => res.status(200))
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


module.exports.purchase = async (req, res, next) => {
  const order = new Order(req.body)

  await order.save()
  
  var create_payment_json = {
    intent: "sale",
    payer: {
        payment_method: "paypal"
    },
    redirect_urls: {
        return_url: `http://localhost:3001/shops/${req.body.shopName}/orders/${order.id}/modify`,
        cancel_url: `http://localhost:3000/shops/${req.body.shopName}/failed`
    },
    transactions: [{
        item_list: {
            items: req.body.cart.map(item => {
              const obj = {
                name: item.name,
                sku: item.id,
                price: parseInt(item.price),
                currency: "EUR",
                quantity: item.amount
              }
              return obj
            })
        },
        amount: {
            currency: "EUR",
            total: req.body.cart.reduce((acc, item)=> acc + (parseInt(item.price)*item.amount), 0).toString()
        },
        description: `Order for articles purchased at ${req.body.shopName}`
    }]
  };
  
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        console.log(JSON.stringify(error))
        throw error;
    } else {
        res.json({ url: payment.links[1].href })
    }
  });

  
}

module.exports.confirmPayment = (req, res, next) => {
  const id = req.params.id

  Order.findById(id)
    .then(order => {
      if (order) {
        order.status = "in process"
        return order.save().then( order => {
          
          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
          });
          
          transporter.sendMail({
            from: `"My Awesome Project 👻"`,
            to: "guillermolucena@hotmail.com",
            subject: 'Hola Julio!!!!', 
            text: 'Awesome Message',
            html: '<b style="width: 500px; height: 500px; color: blue; background-color: red; border: green solid 3px; font-size: 5rem;">Funciona!</b>'
          })
            .then(info => console.log(info))
            .catch(error => console.log(error))

          res.status(200).redirect(`http://localhost:3000/shops/${order.shopName}/success/${order.id}`)
        })
      }
      else createError(404, 'shop not found')
    })
    .catch(next)

}


module.exports.editShop = (req, res, next) => {
  const shop = req.body
  delete shop.email
  delete shop.password
  delete shop.name
  console.log(req.files)

  const { name } = req.user

  if (req.files) {
    req.body.shop.styles.logo = req.files.logo.secure_url;
    req.body.shop.styles.landingImage.backgroundImage = `url(${req.file.background.secure_url})`
  }
  
 if (!shop.styles.landingImage.backgroundImage.includes('url(')) shop.styles.landingImage.backgroundImage = `url(${shop.styles.landingImage.backgroundImage})`

  Shop.findOneAndUpdate({name: name}, { $set: shop}, { new: true, runValidators: true})
    .then(shop => {
      if (shop) res.json(shop)
      else createError(404, 'shop not found')
    })
    .catch(next)
}
