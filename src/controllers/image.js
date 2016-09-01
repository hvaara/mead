const Boom = require('boom')
const transformer = require('../transform/transformer')

const mimeTypes = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml'
}

module.exports = (req, res, next) => {
  const {sourceAdapter} = res.locals
  const urlPath = req.params['0']
  const transformStream = transformer(req, res)

  if (transformStream instanceof Error) {
    next(Boom.badRequest(transformStream))
    return
  }

  transformStream.on('info', sendHeaders)

  sourceAdapter.getImageStream(urlPath, (err, stream) => {
    if (err) {
      handleError(err)
      return
    }

    stream
      .on('error', handleError)
      .pipe(transformStream)
      .on('error', handleError)
      .pipe(res)
  })

  function sendHeaders(info) {
    const mimeType = info.format && mimeTypes[info.format]
    if (mimeType) {
      res.setHeader('Content-Type', mimeType)
    }

    const cache = res.locals.source.cache || {}
    if (cache.ttl) {
      res.setHeader('Cache-Control', `public, max-age=${cache.ttl}`)
    }

    res.setHeader('X-Powered-By', 'mead.science')
  }

  function handleError(err) {
    if (err.isBoom) {
      return next(err)
    }

    return next(Boom.badImplementation(err))
  }
}
