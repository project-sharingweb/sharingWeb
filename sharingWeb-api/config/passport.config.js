const passport = require ('passport')
const Shop = require ('../models/shop.model')
const LocalStrategy = require ('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser((user, next) => {
  next(null, user.id);
})

passport.deserializeUser((id, next) => {
  Shop.findById(id)
    .then(user => next(null, user))
    .catch(next)
})


passport.use('auth-local', new LocalStrategy ({
  usernameField: 'name',
  passwordField: 'password'
  }, (name, password, next) => {
    Shop.findOne({ name: name} )
      .then (shop => {
        if (!shop) {
          next(null, false, 'Invalid name or password');
        }
        else {
          return shop.checkPassword(password)
          .then(match => {
            if (!match) {
              next(null, false, 'Invalid name or password');
            }
            else { next(null, shop); }
          })
        }
      })
      .catch(error => next(error))
}))


passport.use('google-auth', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, authenticateOAuthUser));

function authenticateOAuthUser(accessToken, refreshToken, profile, next) {
  const provider  = `${profile.provider}Id`;
  const socialId  = profile.id;
  const username  = profile.displayName;
  const email     = profile.emails ? profile.emails[0].value:undefined;
  const avatarURL = profile.picture || profile.photos && profile.photos[0].value;
  
  User.findOne({
    $or:[
      { email: email },
      { [ `social.${provider}` ]: socialId }
    ]
  })
    .then( user => {
      if (user) { next(null,user); }
      else if (!user){ 
        user = new User({
          username: username,
          email:    email,
          password: Math.random().toString(35),
          social: {
            [ provider ]: socialId
          },
          avatarURL: avatarURL 
        })
        return user.save()
          .then( user => next(null, user) )
      }
    })
    .catch(next)
}