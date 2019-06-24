const passport = require ('passport')
const Shop = require ('../models/shop.model')
const LocalStrategy = require ('passport-local').Strategy

passport.serializeUser((user, next) => {
  next(null, user.id);
})

passport.deserializeUser((id, next) => {
  Shop.findById(id)
    .then(user => next(null, user))
    .catch(next)
})


passport.use('auth-local', new LocalStrategy ({
  usernameField: 'email',
  passwordField: 'password'
  }, (email, password, next) => {
    Shop.findOne({ email: email} )
      .then (shop => {
        if (!shop) {
          next(null, false, 'Invalid email or password');
        }
        else {
          return shop.checkPassword(password)
          .then(match => {
            if (!match) {
              next(null, false, 'Invalid email or password');
            }
            else { next(null, shop); }
          })
        }
      })
      .catch(error => next(error))
  }))

