const Boom = require('boom')
const pump = require('pump')
const sharp = require('sharp')
const values = require('lodash/values')
const getStream = require('get-stream')
const parameters = require('../parameters')
const transformer = require('../transform/transformer')
const callMiddlewares = require('../callMiddlewares')
const errorTransformer = require('../transform/errorTransformer')
const ValidationError = require('../errors/validationError')

const mimeTypes = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml'
}

module.exports = (request, response, next) => {
  const {sourceAdapter} = response.locals
  const {config, plugins} = request.app.locals
  const urlPath = request.params['0']

  const responseHandlers = values(plugins['response-handler'] || {})
  const metadataResolvers = values(plugins['metadata-resolver'] || {})
  const context = {request, response, urlPath}
  const pixelLimit = typeof config.vips.limitInputPixels === 'undefined' ? 268402689 : config.vips.limitInputPixels

  context.metadata = null
  for (let i = 0; !context.metadata && i < metadataResolvers.length; i++) {
    context.metadata = metadataResolvers[i](context)
  }

  let params = {}
  try {
    params = parameters.fromQueryString(request.query, params, config)
    params = parameters.fromRequest(request, params, config)
    params = context.metadata ? finalizeParams(context.metadata) : params
    context.parameters = params
  } catch (err) {
    next(err instanceof ValidationError ? Boom.badRequest(err) : err)
    return
  }

  sourceAdapter.getImageStream(context, async (err, stream) => {
    if (err) {
      handleError(err)
      return
    }

    const isSvg = /\.svg$/i.test(context.urlPath)
    const isGif = /\.gif$/i.test(context.urlPath)
    const formatSpecified = request.query.fm
    const transformUnsupported = (isSvg || isGif) && !formatSpecified

    if (transformUnsupported) {
      passthrough(stream)
      return
    }

    let imageBuffer
    try {
      imageBuffer = await getStream.buffer(stream)
    } catch (readErr) {
      handleError(readErr)
      return
    }

    const imageStream = sharp(imageBuffer).limitInputPixels(pixelLimit)

    try {
      let finalParams
      if (context.metadata) {
        finalParams = await params
      } else {
        const fromImage = await resolveMetadataFromImage(imageStream)
        finalParams = await finalizeParams(fromImage)
      }

      const image = transformer(imageStream, finalParams, context.metadata)
      const transformed = await image.toBuffer({
        resolveWithObject: true
      })

      callMiddlewares(responseHandlers, {
        request,
        response,
        urlPath,
        headers: getHeaders(transformed.info, finalParams, response),
        body: transformed.data,
        info: transformed.info
      })
    } catch (transformErr) {
      handleError(transformErr)
    }
  })

  function passthrough(imageStream) {
    pump(imageStream, response, handleError)
  }

  function finalizeParams(meta) {
    const fromMeta = parameters.fromMetadata(params, meta, config)
    return parameters.finalize(fromMeta)
  }

  async function resolveMetadataFromImage(imageStream) {
    context.metadata = await imageStream.metadata()
    return context.metadata
  }

  function handleError(err) {
    // If upstream closed our connection prematurely, don't treat that as an error
    // Error is emitted from `end-of-stream` (dependency of `pump`).
    if (!err || err.message.includes('premature close')) {
      return
    }

    next(errorTransformer(err))
  }
}

function getHeaders(info, params, response) {
  const headers = {}

  // Security
  headers['X-Content-Type-Options'] = 'nosniff'

  // Content type
  const mimeType = info.format && mimeTypes[info.format]
  headers['Content-Type'] = mimeType || 'application/octet-stream'

  // Cache settings
  const cache = response.locals.source.cache || {}
  if (cache.ttl) {
    const ttl = cache.ttl | 0 // eslint-disable-line no-bitwise
    headers['Cache-Control'] = `public, max-age=${ttl}`
  }

  // Download?
  if (typeof params.download !== 'undefined') {
    const name = `"${encodeURIComponent(params.download || '')}"`
    headers['Content-Disposition'] = `attachment;filename=${name}`
  }

  // Parameter-based headers
  const paramHeaders = params.responseHeaders || {}
  Object.keys(paramHeaders).forEach(header => {
    const value = paramHeaders[header]
    headers[header] = Array.isArray(value) ? value.join(',') : value
  })

  // Shameless promotion
  headers['X-Powered-By'] = 'mead.science'

  return headers
}
