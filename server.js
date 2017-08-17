const bodyParser = require('body-parser')
const express = require('express')
const getFaviconForUrl = require('./get-favicon-for-url')
const seed = require('./seed')
require('./site')

let app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(bodyParser.text())

app.post('/get-favicon', (req, res) => {
  const { url } = req.body
  return getFaviconForUrl(url, false)
    .then((result) => {
      res.status(200).send(result)
    })
    .catch((e) => {
      console.log('error in get favicon', e)
      res.status(500).send(e.toString())
    })
})

app.post('/run-seed', (req, res) => {
  const { min, max } = req.body
  seed.run({min, max})
  res.status(200).send('Running')
})

// route to free heroku server from sleeping
app.get('/', (req, res) => {
  res.status(200).send('I am awake')
})

const server = app.listen(process.env.PORT || 3000)

module.exports = server
