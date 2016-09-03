const Boom = require('boom')
const transformer = require('../transform/transformer')
const validateTransforms = require('../transform/validate')

const mimeTypes = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml'
}

module.exports = (request, response, next) => {
  const {sourceAdapter} = response.locals
  const urlPath = request.params['0']

  let params
  try {
    params = validateTransforms(request.query)
  } catch (err) {
    next(Boom.badRequest(err))
    return
  }

  const transformStream = transformer(params)
  transformStream.on('info', info => sendHeaders(info, response))

  sourceAdapter.getImageStream(urlPath, (err, stream) => {
    if (err) {
      handleError(err)
      return
    }

    stream
      .on('error', handleError)
      .pipe(transformStream)
      .on('error', handleError)
      .pipe(response)
  })

  function handleError(err) {
    next(err.isBoom ? err : Boom.badImplementation(err))
  }
}

function sendHeaders(info, response) {
  const mimeType = info.format && mimeTypes[info.format]
  response.setHeader('Content-Type', mimeType || 'application/octet-stream')

  const cache = response.locals.source.cache || {}
  if (cache.ttl) {
    response.setHeader('Cache-Control', `public, max-age=${cache.ttl}`)
  }

  response.setHeader('X-Powered-By', 'mead.science')
}
