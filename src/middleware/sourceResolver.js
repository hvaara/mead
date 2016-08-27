const Boom = require('boom')
const patterns = require('../validators/patterns')

module.exports = app => {
  const {config, plugins} = app.locals
  const requestedResolver = config.sourceResolver
  const resolvers = plugins['source-resolver'] || {}
  const handler = resolvers[requestedResolver]
  if (!handler) {
    throw new Error(`sourceResolver plugin with name "${requestedResolver}" not found`)
  }

  const method = config.sourceMode
  if (method === 'path') {
    return (req, res, next) => {
      const [, value] = req.url.match(patterns.sourcePath) || []
      if (!value) {
        next(Boom.badRequest('Source name missing from URL'))
        return
      }

      handler(value, req, res, next)
    }
  }

  if (method === 'vhost') {
    return (req, res, next) => {
      const subdomain = req.hostname.split('.', 2)[0]
      handler(subdomain, req, res, next)
    }
  }

  if (typeof method === 'function') {
    return method
  }

  throw new Error(`Unknown source mode "${method}". Use "path" or "vhost"`)
}
