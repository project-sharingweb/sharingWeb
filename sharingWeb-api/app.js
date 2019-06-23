require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


require('./config/db.config')
const session = require('./config/session.config')

const homeRouter = require('./routes/home.routes');
const authRouter = require('./routes/auth.routes');
const shopRouter = require('./routes/shop.routes');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session);

app.use('/auth', authRouter);
app.use('/shops', shopRouter);
app.use('/', homeRouter);


module.exports = app;
