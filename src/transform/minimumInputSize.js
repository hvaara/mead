const getOutputSize = require('./outputSize')

module.exports = function minimumInputSize(params, meta) {
  // The dimensions of the full image
  const full = {width: meta.width, height: meta.height}

  // If we are doing no size limiting, that's our answer right there
  if (!params.width && !params.height) {
    return full
  }

  // Assume the user want it all
  let source = full

  // Oh, she didn't. She selected a subset rectangle
  if (params.sourceRectangle) {
    const [,, width, height] = params.sourceRectangle
    source = {width, height}
  }

  // Compute the fit
  const out = params.fit ? fromFit(params, source) : fitClip(params, source)

  // Compute the actual source image size
  const minimum = {
    width: Math.round(full.width / out.xFactor),
    height: Math.round(full.height / out.yFactor)
  }

  return min(full, minimum)
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
  return getOutputSize(params, meta, {sizeMode: 'crop'})
}

function fitMin(params, meta) {
  return getOutputSize(params, meta, {sizeMode: 'simple'})
}

// function fromResize(params, meta) {
//   return getOutputSize(params, meta, {sizeMode: 'simple'})
// }
