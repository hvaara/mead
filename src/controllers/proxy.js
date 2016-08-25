const needle = require('needle')
const transformer = require('../transform/transformer')

module.exports = (req, res) => {
  const imageUrl = req.params.url
  if (!/^https?:\/\//i.test(imageUrl)) {
    res.boom.badRequest('Only http/https URLs are supported')
    return
  }

  const transformStream = transformer(req, res)
  if (transformStream instanceof Error) {
    res.boom.badRequest(transformStream)
    return
  }

  transformStream.on('error', info => {
    // @todo This might actually be a 500.
    // Let's see what kind of errors it throws
    res.boom.badRequest(info)
    return
  })

  needle.get(imageUrl)
    .on('readable', emitErrorOnHttpError)
    .on('error', handleHttpError)
    .pipe(transformStream)
    .pipe(res)

  function handleHttpError(err) {
    if (err.code === 404) {
      res.boom.notFound('Remote image not found')
    } else {
      res.boom.badGateway(err.message)
    }
  }

  function emitErrorOnHttpError() {
    const {statusCode, statusMessage} = this.request.res
    if (statusCode < 400) {
      return
    }

    const err = new Error(`Remote source returned HTTP ${statusCode} ${statusMessage}`)
    err.code = statusCode

    this.emit('error', err)
    this.unpipe()
  }
}
