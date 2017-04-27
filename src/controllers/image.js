const Boom = require('boom')
const sharp = require('sharp')
const values = require('lodash/values')
const parameters = require('../parameters')
const transformer = require('../transform/transformer')
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

  const metadataResolvers = values(plugins['metadata-resolver'] || {})
  const context = {request, response, urlPath}
  const pixelLimit = typeof config.vips.limitInputPixels === 'undefined'
    ? 268402689
    : config.vips.limitInputPixels

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

  sourceAdapter.getImageStream(context, (err, stream) => {
    if (err) {
      handleError(err)
      return
    }

    const imageStream = sharp().limitInputPixels(pixelLimit)

    stream
      .on('error', handleError)
      .pipe(imageStream)
      .on('error', handleError)

    const resolveParams = context.metadata
      ? Promise.resolve(params)
      : resolveMetadataFromImage(imageStream).then(finalizeParams)

    resolveParams
      .then(finalParams => transform(imageStream, finalParams, context.metadata))
      .catch(handleError)
  })

  function transform(imageStream, finalParams) {
    const transformStream = transformer(imageStream, finalParams, context.metadata)
    transformStream
      .on('info', info => sendHeaders(info, finalParams, response))
      .pipe(response)
      .on('error', handleError)
  }

  function finalizeParams(meta) {
    return parameters.finalize(parameters.fromMetadata(params, meta, config))
  }

  function resolveMetadataFromImage(imageStream) {
    return imageStream.metadata().then(meta => {
      context.metadata = meta
      return meta
    })
  }

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

  // Parameter-based headers
  const paramHeaders = params.responseHeaders || {}
  Object.keys(paramHeaders).forEach(header => {
    const value = paramHeaders[header]
    response.setHeader(header, Array.isArray(value) ? value.join(',') : value)
  })

  // Shameless promotion
  response.setHeader('X-Powered-By', 'mead.science')
}
