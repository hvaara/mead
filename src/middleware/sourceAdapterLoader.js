const Boom = require('boom')

module.exports = (req, res, next) => {
  const source = res.locals.source
  const adapter = req.app.locals.plugins.source[source.adapter.type]
  if (!adapter) {
    next(Boom.notImplemented(`Adapter type "${source.adapter.type}" not implemented`))
    return
  }

  res.locals.sourceAdapter = adapter(source.adapter.config || {})
  next()
}
