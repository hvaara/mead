const sharp = require('sharp')
const drawCrosshairs = require('../draw/drawCrosshairs')
const pipeline = [quality, fit, resize, rotation, background, flip, output]

function getTransformer(tr, params, meta) {
  pipeline.forEach(mod => mod(tr, params, meta))
  return tr
}

function quality(tr, params) {
  tr.quality(params.quality || 75)
}

function resize(tr, params) {
  if (!params.skipResize && (params.width || params.height)) {
    tr.resize(params.width, params.height)
  }
}

function guessSizeFromParams(params, meta) {
  const {width, height} = params
  if (width && height) {
    return {width, height}
  }

  if (width) {
    return {width, height: width / (meta.width / meta.height)}
  }

  return {width: height * (meta.width / meta.height), height}
}

function fit(tr, params, meta) {
  switch (params.fit) {
    case 'crop':
      return fitCrop(...arguments)
    case 'fill':
      return tr.embed()
    case 'fillmax':
      return fitFillMax(...arguments)
    case 'max':
      return tr.withoutEnlargement().max()
    case 'min':
      return fitMin(...arguments)
    case 'scale':
      return fitScale(...arguments)
    case 'clip':
    default:
      return tr.max()
  }
}

function fitScale(tr, params) {
  const hasExactSize = params.width && params.height
  if (hasExactSize) {
    tr.ignoreAspectRatio()
  } else {
    tr.max()
  }
}

function fitFillMax(tr, params, meta) {
  tr.withoutEnlargement().max()

  if ((!params.height && params.width < meta.width)
    || (!params.width && params.height < meta.height)) {
    return
  }

  const aspect = meta.width / meta.height

  const targetWidth = params.width || Math.round(params.height * aspect)
  const targetHeight = params.height || Math.round(params.width / aspect)

  let resizeWidth = Math.min(targetWidth, meta.width)
  let resizeHeight = Math.min(targetHeight, meta.height)

  if ((resizeWidth / resizeHeight) > aspect) {
    resizeWidth = resizeHeight * aspect
  } else {
    resizeHeight = resizeWidth / aspect
  }

  const addWidth = (targetWidth - Math.round(resizeWidth)) / 2
  const addHeight = (targetHeight - Math.round(resizeHeight)) / 2

  tr.extend({
    top: Math.max(0, Math.ceil(addHeight)),
    bottom: Math.max(0, Math.floor(addHeight)),
    left: Math.max(0, Math.ceil(addWidth)),
    right: Math.max(0, Math.floor(addWidth))
  })
}

function gravityCrop(tr, params, meta) {
  const cropType = typeof params.crop === 'string'
    ? sharp.strategy[params.crop]
    : params.crop

  tr
    .resize(params.width, params.height)
    .crop(cropType || 'center')
}

function getFocalCoords(params) {
  const map = {
    [sharp.gravity.west]: {x: 0, y: 0.5},
    [sharp.gravity.east]: {x: 1, y: 0.5},
    [sharp.gravity.north]: {x: 0.5, y: 0},
    [sharp.gravity.south]: {x: 0.5, y: 1},
    [sharp.gravity.northwest]: {x: 0, y: 0},
    [sharp.gravity.northeast]: {x: 1, y: 0},
    [sharp.gravity.southwest]: {x: 0, y: 1},
    [sharp.gravity.southeast]: {x: 1, y: 1}
  }

  const coords = map[params.crop] || {x: 0.5, y: 0.5}
  coords.x = isDefined(params.focalPointX) ? params.focalPointX : coords.x
  coords.y = isDefined(params.focalPointY) ? params.focalPointY : coords.y

  return coords
}

function fitCrop(tr, params, meta) {
  params.outputSize = guessSizeFromParams(params, meta)
  params.skipResize = true

  if (typeof params.focalPointX === 'undefined' && typeof params.focalPointY === 'undefined') {
    gravityCrop(...arguments)
    return
  }

  const originalRatio = meta.width / meta.height

  const targetWidth = params.outputSize.width
  const targetHeight = params.outputSize.height

  let resizeWidth = targetWidth
  let resizeHeight = targetHeight

  if ((resizeWidth / resizeHeight) < originalRatio) {
    resizeWidth = resizeHeight * originalRatio
  } else {
    resizeHeight = resizeWidth / originalRatio
  }

  tr.resize(
    Math.round(resizeWidth),
    Math.round(resizeHeight)
  )

  const focal = getFocalCoords(params)
  const center = {
    x: (resizeWidth * focal.x) - (targetWidth / 2),
    y: (resizeHeight * focal.y) - (targetHeight / 2)
  }

  const pos = {
    left: clamp(center.x, 0, resizeWidth - targetWidth),
    top: clamp(center.y, 0, resizeHeight - targetHeight)
  }

  const crop = {
    left: Math.round(pos.left),
    top: Math.round(pos.top),
    width: Math.round(targetWidth),
    height: Math.round(targetHeight)
  }

  if (params.focalPointTarget) {
    const focalCoords = {
      x: (resizeWidth * focal.x) - pos.left,
      y: (resizeHeight * focal.y) - pos.top
    }

    const crossHairs = drawCrosshairs(
      {width: targetWidth, height: targetHeight},
      focalCoords
    )

    tr.overlayWith(Buffer.from(crossHairs, 'utf8'), {top: 0, left: 0})
  }

  tr.extract(crop)
}

function clamp(inp, min, max) {
  return Math.min(max, Math.max(min, Math.round(inp)))
}

function fitMin(tr, params, meta) {
  params.outputSize = guessSizeFromParams(params, meta)
  params.skipResize = true

  const targetWidth = Math.round(params.outputSize.width)
  const targetHeight = Math.round(params.outputSize.height)

  tr.withoutEnlargement().resize(targetWidth, targetHeight).crop()

  if (targetWidth < meta.width && targetHeight < meta.height) {
    return
  }

  const originalRatio = meta.width / meta.height
  const targetRatio = targetWidth / targetHeight

  let newWidth = Math.round(targetRatio * meta.height)
  let newHeight = meta.height
  if (targetRatio > originalRatio) {
    newWidth = meta.width
    newHeight = Math.round(meta.width / targetRatio)
  }

  tr.resize(newWidth, newHeight).crop()
}

function rotation(tr, params) {
  // Auto-rotate by EXIF if no rotation is explicitly set
  if (typeof params.rotation === 'undefined') {
    tr.rotate()
  } else {
    tr.rotate(params.rotation)
  }
}

function background(tr, params) {
  if (params.backgroundColor) {
    // @todo Might have to call flatten or similar if going from gif/png
    // to jpeg, in order for the background color to apply
    tr.background(params.backgroundColor)
  }
}

function flip(tr, params) {
  if (!params.flip) {
    return
  }

  if (params.flip.includes('v')) {
    tr.flip()
  }

  if (params.flip.includes('h')) {
    tr.flop()
  }
}

function output(tr, params) {
  const out = params.output || {}
  if (out.format) {
    tr.toFormat(out.format)
  }

  if (out.progressive) {
    tr.progressive()
  }
}

function isDefined(thing) {
  return typeof thing !== 'undefined'
}

module.exports = getTransformer
