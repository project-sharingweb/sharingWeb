const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sharingWeb-api'


mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then (() => console.log(`Succesfully connected to database: ${MONGODB_URI}`))
  .catch(error => console.error(`An error ocurred when connecting to database: ${MONGODB_URI}`, error))