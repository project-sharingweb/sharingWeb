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

  if (req.file) {
    product.image = req.file.secure_url;
  }

  product.save()
    .then(product => res.status(201).json(product))
    .catch(next)
}

module.exports.deleteProduct = (req, res, next) => {
  const product = req.body

  Product.findByIdAndDelete(product.id)
    .then(product => res.status(200).json(product))
    .catch(next)
} 

module.exports.ordersList = (req, res, next) => {
  const shopName = req.params.name

  Order.find({shopName: shopName})
    .populate('products')
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
  const shop = req.params.name

  Shop.findOne({urlName: shop})
    .then(shop => {
      Order.findById(id)
      .populate('products')
      .then(order => {
        if (order) {
          order.status = "in process"
          return order.save().then( order => {
            let list = order.products.map((item, i) => { 
              return `<div style="background-color:transparent;">
              <div class="block-grid four-up no-stack" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #FFFFFF;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:${ (i % 2 === 0) ? "#FFFFFF;": "#F9F9F9;"}">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:#FFFFFF"><![endif]-->
              <!--[if (mso)|(IE)]><td align="center" width="162" style="background-color:#FFFFFF;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 162px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <div align="center" class="img-container center fixedwidth" style="padding-right: 0px;padding-left: 0px;">
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 0px;padding-left: 0px;" align="center"><![endif]--><img align="center" alt="Image" border="0" class="center fixedwidth" src=${item.image} style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 130px; display: block;" title="Image" width="130"/>
              <!--[if mso]></td></tr></table><![endif]-->
              </div>
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td><td align="center" width="162" style="background-color:#FFFFFF;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 1px dotted #E8E8E8;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:30px; padding-bottom:35px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 161px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:1px dotted #E8E8E8; padding-top:30px; padding-bottom:35px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 0px; padding-top: 10px; padding-bottom: 5px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:5px;padding-left:0px;">
              <div style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #555555;">
              <p style="font-size: 14px; line-height: 19px; text-align: left; margin: 0;"><span style="font-size: 16px; color: #2190e3;"><strong>${item.name}</strong></span></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 0px; padding-top: 0px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td><td align="center" width="162" style="background-color:#FFFFFF;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 1px dotted #E8E8E8;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:55px; padding-bottom:5px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 161px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:1px dotted #E8E8E8; padding-top:55px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 0px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:0px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
              <div style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #555555;">
              <p style="font-size: 14px; line-height: 24px; text-align: center; margin: 0;"><span style="font-size: 20px;"><strong>${order.amounts[i].toString()}</strong></span></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top">
              <table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="30" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 30px;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td height="30" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td>
              </tr>
              </tbody>
              </table>
              </td>
              </tr>
              </tbody>
              </table>
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td><td align="center" width="162" style="background-color:#FFFFFF;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:55px; padding-bottom:5px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 162px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:55px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 15px; padding-left: 0px; padding-top: 0px; padding-bottom: 0px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:0px;padding-right:15px;padding-bottom:0px;padding-left:0px;">
              <div style="line-height: 14px; font-size: 12px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #555555;">
              <p style="line-height: 24px; text-align: center; font-size: 12px; margin: 0;"><span style="font-size: 20px;"><span style="line-height: 24px; font-size: 20px;"><strong>${(parseInt(item.price)*order.amounts[i]).toString()}</strong></span></span></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
              </div>
              </div>
              </div>`
            })
            
            let transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: { user, pass }
            });
            
            transporter.sendMail({
              from: `${order.urlName}`,
              to: `${order.email}`,
              subject: `Thank you ${order.name}`, 
              text: `Order confirmation number #${order.number}`,
              html: `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
              <head>
              <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
              <meta content="width=device-width" name="viewport"/>
              <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
              <title></title>
              <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/>
              <style type="text/css">
                  body {
                    margin: 0;
                    padding: 0;
                  }
              
                  table,
                  td,
                  tr {
                    vertical-align: top;
                    border-collapse: collapse;
                  }
              
                  * {
                    line-height: inherit;
                  }
              
                  a[x-apple-data-detectors=true] {
                    color: inherit !important;
                    text-decoration: none !important;
                  }
                </style>
              <style id="media-query" type="text/css">
                  @media (max-width: 670px) {
              
                    .block-grid,
                    .col {
                      min-width: 320px !important;
                      max-width: 100% !important;
                      display: block !important;
                    }
              
                    .block-grid {
                      width: 100% !important;
                    }
              
                    .col {
                      width: 100% !important;
                    }
              
                    .col>div {
                      margin: 0 auto;
                    }
              
                    img.fullwidth,
                    img.fullwidthOnMobile {
                      max-width: 100% !important;
                    }
              
                    .no-stack .col {
                      min-width: 0 !important;
                      display: table-cell !important;
                    }
              
                    .no-stack.two-up .col {
                      width: 50% !important;
                    }
              
                    .no-stack .col.num4 {
                      width: 33% !important;
                    }
              
                    .no-stack .col.num8 {
                      width: 66% !important;
                    }
              
                    .no-stack .col.num4 {
                      width: 33% !important;
                    }
              
                    .no-stack .col.num3 {
                      width: 25% !important;
                    }
              
                    .no-stack .col.num6 {
                      width: 50% !important;
                    }
              
                    .no-stack .col.num9 {
                      width: 75% !important;
                    }
              
                    .video-block {
                      max-width: none !important;
                    }
              
                    .mobile_hide {
                      min-height: 0px;
                      max-height: 0px;
                      max-width: 0px;
                      display: none;
                      overflow: hidden;
                      font-size: 0px;
                    }
              
                    .desktop_hide {
                      display: block !important;
                      max-height: none !important;
                    }
                  }
                </style>
              </head>
              <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #F5F5F5;">
              <table bgcolor="#F5F5F5" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #F5F5F5; width: 100%;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td style="word-break: break-word; vertical-align: top;" valign="top">
              <div style="background-color:transparent;">
              <div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
              <div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
              <div style="width:100% !important;">
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top">
              <table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="10" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 10px;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td height="10" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td>
              </tr>
              </tbody>
              </table>
              </td>
              </tr>
              </tbody>
              </table>
              </div>
              </div>
              </div>
              </div>
              </div>
              </div>
              <div style="background-color:transparent;">
              <div class="block-grid two-up no-stack" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #FFFFFF;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
              <div class="col num6" style="min-width: 320px; max-width: 325px; display: table-cell; vertical-align: top; width: 325px;">
              <div style="width:100% !important;">
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:25px; padding-bottom:25px; padding-right: 0px; padding-left: 25px;">
              <div align="left" class="img-container left fullwidthOnMobile fixedwidth" style="padding-right: 0px;padding-left: 0px;">
              <div style="font-size:1px;line-height:5px"> </div><img alt="Image" border="0" class="left fullwidthOnMobile fixedwidth" src=${shop.logo} style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 150px; display: block;" title="Image" width="195"/>
              </div>
              </div>
              </div>
              </div>
              <div class="col num6" style="min-width: 320px; max-width: 325px; display: table-cell; vertical-align: top; width: 325px;">
              <div style="width:100% !important;">
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:25px; padding-bottom:25px; padding-right: 25px; padding-left: 0px;">
              <div style="font-size: 2rem; padding-top: 25px">Order Number: #${order.number}</div>
              </div>
              </div>
              </div>
              </div>
              </div>
              </div>
              <div style="background-color:transparent;">
              <div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #D6E7F0;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:#D6E7F0;background-image:url('images/bg_cart_2.png');background-position:top center;background-repeat:no-repeat">
              <div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
              <div style="width:100% !important;">
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:55px; padding-bottom:60px; padding-right: 0px; padding-left: 0px;">
              <div style="color:#052d3d;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:20px;padding-right:10px;padding-bottom:5px;padding-left:15px;">
              <div style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #052d3d;">
              <p style="font-size: 14px; line-height: 45px; text-align: center; margin: 0;"><span style="font-size: 38px;"><strong><span style="line-height: 45px; font-size: 38px;">THANK <span style="color: #fc7318;">YOU!</span></span></strong></span></p>
              </div>
              </div>
              <div style="color:#052D3D;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:0px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
              <div style="line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; font-size: 12px; color: #052D3D;">
              <p style="line-height: 26px; text-align: center; font-size: 12px; margin: 0;"><span style="font-size: 22px;"><strong>Here are the details of your purchase:</strong></span></p>
              </div>
              </div>
              </div>
              </div>
              </div>
              </div>
              </div>
              </div>
              <div style="background-color:transparent;">
              <div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #FFFFFF;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:#FFFFFF"><![endif]-->
              <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:#FFFFFF;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:5px;"><![endif]-->
              <div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#052d3d;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
              <div style="line-height: 14px; font-size: 12px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #052d3d;">
              <p style="line-height: 24px; text-align: center; font-size: 12px; margin: 0;"><span style="font-size: 20px;">Your products:</span></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
              </div>
              </div>
              </div>
              <div style="background-color:transparent;">
              <div class="block-grid four-up no-stack" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #F8F8F8;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:#F8F8F8;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:#F8F8F8"><![endif]-->
              <!--[if (mso)|(IE)]><td align="center" width="162" style="background-color:#F8F8F8;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid #E8E8E8;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:5px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 162px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid #E8E8E8; padding-top:15px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 0px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:0px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
              <div style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #555555;">
              <p style="font-size: 14px; line-height: 16px; text-align: center; margin: 0;"><strong>ITEM</strong></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td><td align="center" width="162" style="background-color:#F8F8F8;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 1px dotted #E8E8E8;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:5px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 161px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:1px dotted #E8E8E8; padding-top:15px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top">
              <table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="5" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 5px;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td height="5" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td>
              </tr>
              </tbody>
              </table>
              </td>
              </tr>
              </tbody>
              </table>
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td><td align="center" width="162" style="background-color:#F8F8F8;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 1px dotted #E8E8E8;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 15px; padding-left: 15px; padding-top:15px; padding-bottom:5px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 161px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:1px dotted #E8E8E8; padding-top:15px; padding-bottom:5px; padding-right: 15px; padding-left: 15px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 0px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:0px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
              <div style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #555555;">
              <p style="font-size: 14px; line-height: 16px; text-align: center; margin: 0;"><strong>QTY</strong></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td><td align="center" width="162" style="background-color:#F8F8F8;width:162px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:5px;"><![endif]-->
              <div class="col num3" style="max-width: 320px; min-width: 162px; display: table-cell; vertical-align: top; width: 162px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 0px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#555555;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:0px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
              <div style="font-size: 12px; line-height: 14px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #555555;">
              <p style="font-size: 14px; line-height: 16px; text-align: center; margin: 0;"><strong>PRICE</strong></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
              </div>
              </div>
              </div>
              ${list}
              <div style="background-color:transparent;">
              <div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #FFFFFF;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:#FFFFFF"><![endif]-->
              <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:#FFFFFF;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:20px;"><![endif]-->
              <div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:20px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top">
              <table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 0px;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td height="0" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td>
              </tr>
              </tbody>
              </table>
              </td>
              </tr>
              </tbody>
              </table>
              <div align="center" class="button-container" style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;"><tr><td style="padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:34.5pt; width:133.5pt; v-text-anchor:middle;" arcsize="33%" stroke="false" fillcolor="#fc7318"><w:anchorlock/><v:textbox inset="0,0,0,0"><center style="color:#ffffff; font-family:Tahoma, Verdana, sans-serif; font-size:18px"><![endif]--><a href="http://localhost:3000/shops/${order.shopName}/" style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #ffffff; background-color: #fc7318; border-radius: 15px; -webkit-border-radius: 15px; -moz-border-radius: 15px; width: auto; width: auto; border-top: 1px solid #fc7318; border-right: 1px solid #fc7318; border-bottom: 1px solid #fc7318; border-left: 1px solid #fc7318; padding-top: 5px; padding-bottom: 5px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; text-align: center; mso-border-alt: none; word-break: keep-all;" target="_blank"><span style="padding-left:20px;padding-right:20px;font-size:18px;display:inline-block;">
              <span style="font-size: 16px; line-height: 32px;"><span style="font-size: 18px; line-height: 36px;"><strong>Go to our store › </strong></span></span>
              </span></a>
              <!--[if mso]></center></v:textbox></v:roundrect></td></tr></table><![endif]-->
              </div>
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
              </div>
              </div>
              </div>
              <div style="background-color:transparent;">
              <div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #F0F0F0;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:#F0F0F0;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:#F0F0F0"><![endif]-->
              <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:#F0F0F0;width:650px; border-top: none; border-left: none; border-bottom: none; border-right: none;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr bgcolor='#FFFFFF'><td colspan='3' style='font-size:7px;line-height:18px'>&nbsp;</td></tr><tr><td style='padding-top:15px;padding-bottom:15px' width='25' bgcolor='#FFFFFF'><table role='presentation' width='25' cellpadding='0' cellspacing='0' border='0'><tr><td>&nbsp;</td></tr></table></td><td style="padding-right: 35px; padding-left: 35px; padding-top:15px; padding-bottom:5px;"><![endif]-->
              <div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 600px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:18px solid #FFFFFF; border-left:25px solid #FFFFFF; border-bottom:18px solid #FFFFFF; border-right:25px solid #FFFFFF; padding-top:15px; padding-bottom:5px; padding-right: 35px; padding-left: 35px;">
              <!--<![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 15px; padding-left: 15px; padding-top: 15px; padding-bottom: 10px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#052d3d;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:120%;padding-top:15px;padding-right:15px;padding-bottom:10px;padding-left:15px;">
              <div style="line-height: 14px; font-size: 12px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #052d3d;">
              <p style="line-height: 40px; font-size: 12px; text-align: center; margin: 0;"><span style="font-size: 34px;"><span style="color: #fc7318; font-size: 34px; line-height: 40px;"><strong><span style="line-height: 40px; font-size: 34px;">Troubles? <br/></span></strong></span><span style="line-height: 40px; font-size: 34px;">We're here to help you</span></span></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 0px; padding-bottom: 30px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
              <div style="color:#787878;font-family:'Lato', Tahoma, Verdana, Segoe, sans-serif;line-height:150%;padding-top:0px;padding-right:10px;padding-bottom:30px;padding-left:10px;">
              <div style="font-size: 12px; line-height: 18px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; color: #787878;">
              <p style="font-size: 14px; line-height: 27px; text-align: center; margin: 0;"><span style="font-size: 18px;">Contact us at <strong><a href="#" rel="noopener" style="text-decoration: none; color: #2190E3;" target="_blank">${shop.email}</a></strong></span><br/><span style="font-size: 18px; line-height: 27px;">or call us at <span style="color: #2190e3; font-size: 18px; line-height: 27px;"><strong>${shop.contact}</strong></span> <br/></span></p>
              </div>
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
              <!--[if (!mso)&(!IE)]><!-->
              </div>
              <!--<![endif]-->
              </div>
              </div>
              <!--[if (mso)|(IE)]></td><td style='padding-top:15px;padding-bottom:15px' width='25' bgcolor='#FFFFFF'><table role='presentation' width='25' cellpadding='0' cellspacing='0' border='0'><tr><td>&nbsp;</td></tr></table></td></tr><tr bgcolor='#FFFFFF'><td colspan='3' style='font-size:7px;line-height:18px'>&nbsp;</td></tr></table><![endif]-->
              <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
              </div>
              </div>
              </div>
              <div style="background-color:transparent;">
              <div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #FFFFFF;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:#FFFFFF"><![endif]-->
              <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:#FFFFFF;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:5px;"><![endif]-->
              <div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
              <div style="width:100% !important;">
              <!--[if (!mso)&(!IE)]><!-->
              <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
              <!--<![endif]-->
              <table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top">
              <table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; border-top: 0px solid transparent; height: 0px;" valign="top" width="100%">
              <tbody>
              <tr style="vertical-align: top;" valign="top">
              <td height="0" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td>
              </tr>
              </tbody>
              </table>
              </td>
              </tr>
              </tbody>
              </table>
              </div>
              </div>
              </div>
              </div>
              </div>
              </div>
              </td>
              </tr>
              </tbody>
              </table>
              </body>
              </html>`
            })
              .then(info => console.log(info))
              .catch(error => console.log(error))
  
            res.status(200).redirect(`http://localhost:3000/shops/${order.shopName}/success/${order.id}`)
          })
        }
        else createError(404, 'shop not found')
      })
      .catch(next)
    })
    .catch(next)

  

}


module.exports.editShop = async (req, res, next) => {
  const id = req.body.id
  const shop = await Shop.findById(id)
  delete shop.email
  delete shop.password
  delete shop.name


  const { name } = req.user

  if (req.files.logo) {
    shop.logo = req.files.logo[0].secure_url;
  }
  if (req.files.background) {
    shop.styles.landingImage.backgroundImage = `url(${req.files.background[0].secure_url})`
  }
  
 if (!shop.styles.landingImage.backgroundImage.includes('url(')) shop.styles.landingImage.backgroundImage = `url(${shop.styles.landingImage.backgroundImage})`

  Shop.findOneAndUpdate({name: name}, { $set: shop}, { new: true, runValidators: true})
    .then(shop => {
      if (shop) res.json(shop)
      else createError(404, 'shop not found')
    })
    .catch(next)
}

module.exports.editOrder = (req, res, next) => {
  const id = req.params.id

  Order.findById(id)
    .then(order => {
      order.status = "completed"
      order.save()
        .then(order => res.json(order))
        .catch(next)
    })
    .catch(next)

}
