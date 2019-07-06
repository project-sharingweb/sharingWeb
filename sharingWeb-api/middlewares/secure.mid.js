const createError = require('http-errors')

module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    next(createError(401))
  }
}


module.exports.ownedByUser = (req, res, next) => {
  if (req.user.urlName === req.params.name) {
    next();
  } else {
    next(createError(403, 'Not your profile'))
  }
}
