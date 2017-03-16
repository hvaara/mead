const getOutputSize = require('./outputSize')

module.exports = function minimumInputSize(params, meta) {
  let minimum = {width: meta.width, height: meta.height}

  if (params.width || params.height) {
    minimum = min(
      minimum,
      params.fit ? fromFit(params, meta) : fromResize(params, meta)
    )
  }

  return minimum
}

const fitHandlers = {
  clip: fitClip,
  crop: fitCrop,
  fill: fitFill,
  fillmax: fitFillMax,
  max: fitMax,
  min: fitMin,
  scale: fitScale,
}

function min(prev, next) {
  return (prev.width > next.width || prev.height > next.height) ? next : prev
}

function fromFit(params, meta) {
  const handler = fitHandlers[params.fit] || fitClip
  return handler(...arguments)
}

function fitClip(params, meta) {
  return getOutputSize(params, meta, {sizeMode: 'max'})
}

function fitScale(params, meta) {
  const hasExactSize = params.width && params.height
  const sizeMode = hasExactSize ? 'ignoreAspectRatio' : 'max'
  return getOutputSize(params, meta, {sizeMode})
}

function fitFill(params, meta) {
  const sizeMode = params.backgroundColor ? 'embed' : 'max'
  return getOutputSize(params, meta, {sizeMode})
}

function fitMax(params, meta) {
  return getOutputSize(params, meta, {
    sizeMode: 'max',
    withoutEnlargement: true
  })
}

function fitFillMax(params, meta) {
  return fitMax(params, meta)
}

function fitCrop(params, meta) {
  return fitClip(params, meta)
}

function fitMin(params, meta) {
  return getOutputSize(params, meta, {sizeMode: 'simple'})
}

function fromResize(params, meta) {
  return getOutputSize(params, meta, {sizeMode: 'simple'})
}
