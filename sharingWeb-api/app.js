require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport')


require('./config/db.config')
require('./config/paypal.config')
const session = require('./config/session.config')
require('./config/passport.config')
const cors = require('./config/cors.config');

const homeRouter = require('./routes/home.routes');
const authRouter = require('./routes/auth.routes');
const shopRouter = require('./routes/shop.routes');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors)
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/shops', shopRouter);
app.use('/', homeRouter);

app.use((req, res, next) => {
  next(createError(404))
})

//handling errors
app.use(function (error, req, res, next) {
  console.error(error)
  res.status(error.status || 500);

  const data = {}

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400);
    for (field of Object.keys(error.errors)) {
      error.errors[field] = error.errors[field].message
    }
    data.errors = error.errors
  }
  else if (error instanceof mongoose.Error.CastError) {
    error = createError(404, 'Resource not found')
  }
  else if (error.name === "MongoError"){
    res.status(400)
    data.name = "MongoError"
  }

  data.message = error.message;
  res.json(data)
})


module.exports = app;
