const Boom = require('boom')
const sharp = require('sharp')
const transformer = require('../transform/transformer')
const validateTransforms = require('../transform/validate')
const errorTransformer = require('../transform/errorTransformer')

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

  sourceAdapter.getImageStream(urlPath, (err, stream) => {
    if (err) {
      handleError(err)
      return
    }

    const imageStream = sharp()
    stream
      .on('error', handleError)
      .pipe(imageStream)
      .on('error', handleError)

    imageStream.metadata((imgErr, meta) => {
      if (imgErr) {
        handleError(imgErr)
        return
      }

      const transformStream = transformer(imageStream, params, meta)
      transformStream
        .on('info', info => sendHeaders(info, params, response))
        .pipe(response)
        .on('error', handleError)
    })
  })

  function handleError(err) {
    next(errorTransformer(err))
  }
}

function sendHeaders(info, params, response) {
  // Security
  response.setHeader('X-Content-Type-Options', 'nosniff')

  // Content type
  const mimeType = info.format && mimeTypes[info.format]
  response.setHeader('Content-Type', mimeType || 'application/octet-stream')

  // Cache settings
  const cache = response.locals.source.cache || {}
  if (cache.ttl) {
    const ttl = cache.ttl | 0 // eslint-disable-line no-bitwise
    response.setHeader('Cache-Control', `public, max-age=${ttl}`)
  }

  // Download?
  if (typeof params.download !== 'undefined') {
    const name = `"${encodeURIComponent(params.download || '')}"`
    response.setHeader('Content-Disposition', `attachment;filename=${name}`)
  }

  // Shameless promotion
  response.setHeader('X-Powered-By', 'mead.science')
}
