const path = require('path')
const Boom = require('boom')
const express = require('express')
const favicon = require('serve-favicon')
const errorHandler = require('./middleware/errorHandler')
const sourceResolver = require('./middleware/sourceResolver')
const sourceAdapterLoader = require('./middleware/sourceAdapterLoader')
const signedRequests = require('./middleware/signedRequests')
const loadPlugins = require('./plugins/loadPlugins')

module.exports = (config, callback) => {
  const app = express()
  app.locals.config = config
  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy)

  app.locals.plugins = loadPlugins(app, err =>
    callback(err, err ? undefined : initApp(app, config))
  )
}

function initApp(app, config) {
  // Dat middleware
  app.use(favicon(path.join(__dirname, '..', 'assets', 'favicon.ico')))
  app.use(sourceResolver(app))
  app.use(sourceAdapterLoader)
  app.use(signedRequests)

  // Dem routes
  const pre = config.sourceMode === 'path' ? '/:source' : ''
  app.get('/', require('./controllers/index'))
  app.get(`${pre}/*`, require('./controllers/image'))

  if (pre) {
    app.get(`${pre}`, (req, res) => Boom.badRequest('Source name missing from path'))
  }

  // Error handler
  app.use(errorHandler)

  return app
}
