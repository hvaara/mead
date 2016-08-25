const express = require('express')
const boom = require('express-boom')

module.exports = config => {
  const app = express()

  // Dat middleware
  app.use(boom())

  // Dem routes
  app.get('/', require('./controllers/index'))
  app.get('/:url', require('./controllers/proxy'))

  return app
}
