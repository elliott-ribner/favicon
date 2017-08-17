const mongoose = require('mongoose')
const connectionUrl = process.env.MONGO_URL ||  'mongodb://localhost/favicon'
const options = {}

const promise = mongoose.connect(connectionUrl, options)

const conn = mongoose.connection
conn.on('error', console.error.bind(console, 'connection error:'))

const Site = mongoose.model('Site', {
  original_url: String,
  fav_url: String,
  created: Date,
  failed: {type: Boolean, default: false },
  redirect_url: String })

module.exports = Site
