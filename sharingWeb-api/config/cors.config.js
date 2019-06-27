const cors = require('cors')

module.exports = cors({
  credentials: true,
  origin: process.env.ALLOW_ORIGINS || 'http://localhost:3000'
})