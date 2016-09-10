const sharp = require('sharp')
const drawCrosshairs = require('../draw/drawCrosshairs')
const drawBorder = require('../draw/drawBorder')
const drawContainer = require('../draw/drawContainer')
const getOutputSize = require('./outputSize')

const defaultBgColorAlpha = {r: 255, g: 255, b: 255, a: 0} // eslint-disable-line id-length
const defaultBgColor = {r: 255, g: 255, b: 255} // eslint-disable-line id-length

const pipeline = [
  quality,
  background,
  invert,
  sharpen,
  blur,
  trim,
  fit,
  resize,
  rotation,
  flip,
  pad,
  border,
  overlays,
  output
]

const fitHandlers = {
  crop: fitCrop,
  fill: fitFill,
  fillmax: fitFillMax,
  max: fitMax,
  min: fitMin,
  scale: fitScale,
  clip: fitClip
}

function getTransformer(tr, params, meta) {
  pipeline.forEach(mod => mod(tr, params, meta))
  return tr
}

function quality(tr, params) {
  tr.quality(params.quality || 75)
}

function invert(tr, params) {
  if (params.invert) {
    tr.negate()
  }
}

function sharpen(tr, params) {
  if (params.sharpen) {
    tr.sharpen(parseInt(params.sharpen / 30, 10) || undefined)
  }
}

function blur(tr, params) {
  if (params.blur) {
    tr.blur(params.blur ? Math.max(0.3, params.blur / 8) : undefined)
  }
}

function trim(tr, params) {
  if (!params.trim) {
    return tr
  }

  if (params.trim === 'auto') {
    return tr.trim()
  }

  return tr.trim(params.trimTolerance || undefined)
}

function resize(tr, params) {
  if (!params.skipResize && (params.width || params.height)) {
    tr.resize(params.width, params.height)
  }
}

function guessSizeFromParams(params, meta, opts = {}) {
  const filter = opts.round ? size => ({
    width: Math.round(size.width),
    height: Math.round(size.height)
  }) : inp => inp

  return filter(getOutputSize(params, meta, opts))
}

function fit(tr, params, meta) {
  const handler = fitHandlers[params.fit] || fitClip
  handler(...arguments)
}

function fitFill(tr, params, meta) {
  tr.embed()
  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: 'embed'
  })
}

function fitClip(tr, params, meta) {
  tr.max()
  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: 'max'
  })
}

function fitScale(tr, params, meta) {
  const hasExactSize = params.width && params.height

  if (hasExactSize) {
    tr.ignoreAspectRatio()
  } else {
    tr.max()
  }

  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: hasExactSize ? 'ignoreAspect' : 'max'
  })
}

function fitFillMax(tr, params, meta) {
  tr.withoutEnlargement().max()

  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: 'max',
    withoutEnlargement: true
  })

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

  const extendBy = {
    top: Math.max(0, Math.ceil(addHeight)),
    bottom: Math.max(0, Math.floor(addHeight)),
    left: Math.max(0, Math.ceil(addWidth)),
    right: Math.max(0, Math.floor(addWidth))
  }

  params.outputSize.width += extendBy.left + extendBy.right
  params.outputSize.height += extendBy.top + extendBy.bottom

  tr.extend(extendBy)
}

function fitMax(tr, params, meta) {
  tr.withoutEnlargement().max()

  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: 'max',
    withoutEnlargement: true
  })
}

function fitCrop(tr, params, meta) {
  params.skipResize = true

  if (typeof params.focalPointX === 'undefined' && typeof params.focalPointY === 'undefined') {
    fitGravityCrop(...arguments)
    return
  }

  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: params.width && params.height ? 'ignoreAspect' : 'crop'
  })

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

    params.overlays = params.overlays || []
    params.overlays.push(crossHairs)
  }

  params.outputSize = Object.assign({}, guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: 'crop'
  }), {
    width: crop.width,
    height: crop.height
  })

  tr.extract(crop)
}

function fitMin(tr, params, meta) {
  params.skipResize = true
  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: 'simple'
  })

  const {width, height} = params.outputSize

  tr.withoutEnlargement().resize(width, height).crop()

  if (width < meta.width && height < meta.height) {
    return
  }

  const originalRatio = meta.width / meta.height
  const targetRatio = width / height

  let newWidth = Math.round(targetRatio * meta.height)
  let newHeight = meta.height
  if (targetRatio > originalRatio) {
    newWidth = meta.width
    newHeight = Math.round(meta.width / targetRatio)
  }

  params.outputSize = Object.assign(params.outputSize, {
    width: newWidth,
    height: newHeight
  })

  tr.resize(newWidth, newHeight).crop()
}

function fitGravityCrop(tr, params, meta) {
  const cropType = typeof params.crop === 'string'
    ? sharp.strategy[params.crop]
    : params.crop

  tr
    .resize(params.width, params.height)
    .crop(cropType || 'center')

  params.outputSize = guessSizeFromParams(params, meta, {
    round: true,
    sizeMode: params.width && params.height ? 'ignoreAspect' : 'crop'
  })
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

function clamp(inp, min, max) {
  return Math.min(max, Math.max(min, Math.round(inp)))
}

function rotation(tr, params) {
  // Auto-rotate by EXIF if no rotation is explicitly set
  if (typeof params.rotation === 'undefined') {
    tr.rotate()
  } else {
    tr.rotate(params.rotation)
  }
}

function background(tr, params, meta) {
  if (params.backgroundColor) {
    tr.background(params.backgroundColor)
    return
  }

  const format = (params.output && params.output.format) || meta.format
  const hasAlpha = format !== 'jpeg'
  tr.background(hasAlpha ? defaultBgColorAlpha : defaultBgColor)
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

function border(tr, params, meta) {
  if (!params.border) {
    return
  }

  const borderImg = drawBorder(
    params.outputSize,
    params.border.size,
    params.border.color
  )

  params.overlays = params.overlays || []
  params.overlays.push(borderImg)
}

function pad(tr, params, meta) {
  if (!params.pad) {
    return
  }

  if (params.width || params.height) {
    const size = params.pad * 2
    const width = params.width ? params.width - size : undefined
    const height = params.height ? params.height - size : undefined

    tr.resize(width, height)

    const newSize = getNewSize({width, height}, meta)
    params.outputSize = {
      width: newSize.width + size,
      height: newSize.height + size
    }
  }

  tr.extend(params.pad)
}

function overlays(tr, params, meta) {
  const content = params.overlays
  if (!content || content.length === 0) {
    return
  }

  const container = drawContainer(params.outputSize, content)
  tr.overlayWith(Buffer.from(container, 'utf8'), {})
}

function getNewSize(target, original) {
  const newSize = Object.assign({}, target)

  if (target.width) {
    newSize.height = (target.width * original.height) / original.width
  } else {
    newSize.width = (target.height * original.width) / original.height
  }

  return newSize
}

function isDefined(thing) {
  return typeof thing !== 'undefined'
}

module.exports = getTransformer
