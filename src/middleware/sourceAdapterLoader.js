const Boom = require('boom')

module.exports = (req, res, next) => {
  const source = res.locals.source
  const adapter = req.app.locals.plugins.source[source.adapter]
  if (!adapter) {
    next(Boom.notImplemented(`Adapter type "${source.adapter}" not implemented`))
    return
  }

  res.locals.sourceAdapter = adapter(source.config || {})
  next()
}
