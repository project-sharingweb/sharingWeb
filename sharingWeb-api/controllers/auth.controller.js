const Shop = require('../models/shop.model')
const passport = require('passport')
const createError = require('http-errors')


module.exports.register = (req, res, next) => {
  const { email } = req.body

  Shop.findOne({email: email})
    .then(shop => {
      if (shop) {
        throw createError(409, 'Email already registered')
      }
      else {
        return new Shop(req.body).save()
      }
    })
    .then(shop => res.status(201).json(shop))
    .catch(next)
}



module.exports.login = (req, res, next) => {
  passport.authenticate('auth-local', (error, shop, message) => {
    if (error) {next (error)}
    else if (!shop) {
      next(createError(400, message))
    }else {
      req.login(shop, (error) => {
        if (error) {next(error)}
        else {res.status(200).json(shop)}
      })
    }
  })(req, res, next)
}

module.exports.loginWithIDPCallback = ((req, res, next) => {
  const { idp } = req.params;
  passport.authenticate(`${idp}-auth`, (error, user) => {
    if (error) { next(error) }
    else {
      req.login(user, (error) => {
        if (error) { next(error) }
        else { console.error('failed') }
      })
    }
  })(req, res, next)
})


module.exports.logout = (req, res, next) => {
  req.logout()
  res.status(204).json()
}



