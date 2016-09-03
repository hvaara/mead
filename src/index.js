const path = require('path')
const Boom = require('boom')
const semver = require('semver')
const values = require('lodash/values')
const express = require('express')
const favicon = require('serve-favicon')
const errorHandler = require('./middleware/errorHandler')
const sourceResolver = require('./middleware/sourceResolver')
const sourceAdapterLoader = require('./middleware/sourceAdapterLoader')
const loadPlugins = require('./loadPlugins')
const pkg = require('../package.json')

module.exports = (config, callback) => {
  assertNodeVersion()

  const app = express()
  app.locals.config = config
  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy)

  app.locals.plugins = loadPlugins(app, err =>
    callback(err, err ? undefined : initApp(app, config))
  )
}

function initApp(app, config) {
  // Always serve the index route
  app.get('/', require('./controllers/index'))

  // Dat middleware
  app.use(favicon(path.join(__dirname, '..', 'assets', 'favicon.ico')))
  app.use(sourceResolver(app))
  app.use(sourceAdapterLoader)

  // Register plugin-based middleware
  values(app.locals.plugins.middleware || {})
    .forEach(middleware => app.use(middleware))

  // Dem routes
  const pre = config.sourceMode === 'path' ? '/:source' : ''
  app.get(`${pre}/*`, require('./controllers/image'))

  if (pre) {
    app.get(`${pre}`, (req, res) => Boom.badRequest('Source name missing from path'))
  }

  // Error handler
  app.use(errorHandler)

  return app
}

function assertNodeVersion() {
  if (!semver.satisfies(process.version, pkg.engines.node)) {
    throw new Error(
      `Mead requires Node.js ${pkg.engines.node}, you are running ${process.version}`
    )
  }
}
