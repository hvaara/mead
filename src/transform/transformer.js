const sharp = require('sharp')
const round = require('./round')
const drawCrosshairs = require('../draw/drawCrosshairs')
const drawBorder = require('../draw/drawBorder')
const drawContainer = require('../draw/drawContainer')
const getOutputSize = require('./outputSize')
const constrainSize = require('./constrainSize')

const defaultBgColorAlpha = {r: 255, g: 255, b: 255, alpha: 0} // eslint-disable-line id-length
const defaultBgColor = {r: 255, g: 255, b: 255} // eslint-disable-line id-length

const pipeline = [
  sourceRect,
  background,
  invert,
  sharpen,
  blur,
  trim,
  fit,
  resize,
  orientation,
  flip,
  pad,
  border,
  overlays,
  constrainOriginal,
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
  const options = {
    constrain: targetSize => constrainSize(params.maxSize, meta, targetSize),
    getOutputSize: sizeOpts => getOutputSize(params, meta, sizeOpts),
    paramsSize: size => sizeFromParams(params, size)
  }

  pipeline.forEach(mod => mod(tr, params, meta, options))
  return tr
}

function sourceRect(tr, params, meta) {
  const rect = params.sourceRectangle
  if (!rect) {
    return
  }

  const [left, top, width, height] = rect
  tr.extract({left, top, width, height})
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

function resize(tr, params, meta, opts) {
  if (params.fit || (!params.width && !params.height)) {
    return
  }

  const isLandscape = meta.width > meta.height
  const size = params.width > params.maxSize || params.height > params.maxSize
    ? getNewSizeForAspectRatio({[isLandscape ? 'width' : 'height']: params.maxSize}, meta)
    : params

  params.outputSize = round(getOutputSize(params, meta, {sizeMode: 'simple'}))
  tr.resize(
    size.width ? Math.round(size.width) : null,
    size.height ? Math.round(size.height) : null
  )
}

function fit(tr, params, meta) {
  if (!params.fit || (!params.width && !params.height)) {
    params.outputSize = {width: meta.width, height: meta.height}
    return
  }

  const handler = fitHandlers[params.fit] || fitClip
  handler(...arguments)
}

function fitClip(tr, params, meta, opts) {
  params.outputSize = opts.constrain(opts.getOutputSize({sizeMode: 'max'}))
  const {width, height} = params.outputSize

  const isLandscape = width > height
  tr.max().resize(
    isLandscape ? width : undefined,
    isLandscape ? undefined : height
  )
}

function fitScale(tr, params, meta, opts) {
  const hasExactSize = params.width && params.height
  const sizeMode = hasExactSize ? 'ignoreAspectRatio' : 'max'

  params.outputSize = opts.constrain(opts.getOutputSize({sizeMode}))
  const {width, height} = params.outputSize

  const isLandscape = width > height
  let sizeWidth = width
  let sizeHeight = height
  if (!hasExactSize) {
    sizeWidth = isLandscape ? width : undefined
    sizeHeight = isLandscape ? undefined : height
  }

  tr[sizeMode]().resize(sizeWidth, sizeHeight)
}

function fitFill(tr, params, meta, opts) {
  const sizeMode = params.backgroundColor ? 'embed' : 'max'
  params.outputSize = opts.constrain(opts.getOutputSize({sizeMode}))
  const {width, height} = params.outputSize

  if (sizeMode === 'embed') {
    tr.embed().resize(width, height)
  } else {
    const isLandscape = width > height
    tr.max().resize(
      isLandscape ? width : undefined,
      isLandscape ? undefined : height
    )
  }
}

function fitFillMax(tr, params, meta, opts) {
  params.outputSize = opts.constrain(
    opts.getOutputSize({
      sizeMode: 'max',
      withoutEnlargement: true
    })
  )

  const {width, height} = params.outputSize
  const isLandscape = width > height
  tr.withoutEnlargement().max().resize(
    isLandscape ? width : undefined,
    isLandscape ? undefined : height
  )

  const atMax = (!params.height && width < meta.width) || (!params.width && height < meta.height)
  const shouldExtend = params.backgroundColor && !atMax

  if (!shouldExtend) {
    return
  }

  const aspect = meta.width / meta.height

  const targetWidth = Math.min(params.width || Math.round(params.height * aspect), params.maxSize)
  const targetHeight = Math.min(params.height || Math.round(params.width / aspect), params.maxSize)

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

function fitMax(tr, params, meta, opts) {
  params.outputSize = opts.constrain(
    opts.getOutputSize({
      sizeMode: 'max',
      withoutEnlargement: true
    })
  )

  const {width, height} = params.outputSize
  const isLandscape = width > height
  tr.withoutEnlargement().max().resize(
    isLandscape ? width : undefined,
    isLandscape ? undefined : height
  )
}

function fitCrop(tr, params, meta) {
  const hasFocalPoint = isDefined(params.focalPointX) || isDefined(params.focalPointY)
  const fitMethod = hasFocalPoint ? fitFocalCrop : fitGravityCrop
  fitMethod(...arguments)
}

function fitFocalCrop(tr, params, meta, opts) {
  const {width, height} = opts.getOutputSize({sizeMode: 'crop'})

  const aspectWidth = clamp(width, params.minWidth, params.maxWidth)
  const aspectHeight = clamp(height, params.minHeight, params.maxHeight)

  tr.resize(Math.round(aspectWidth), Math.round(aspectHeight))

  const targetWidth = params.width || aspectWidth
  const targetHeight = params.height || aspectHeight

  const focal = getFocalCoords(params)
  const center = {
    x: (aspectWidth * focal.x) - (targetWidth / 2),
    y: (aspectHeight * focal.y) - (targetHeight / 2)
  }

  const pos = {
    left: clamp(center.x, 0, aspectWidth - targetWidth),
    top: clamp(center.y, 0, aspectHeight - targetHeight)
  }

  const crop = {
    left: Math.floor(pos.left),
    top: Math.floor(pos.top),
    width: Math.round(targetWidth),
    height: Math.round(targetHeight)
  }

  if (params.focalPointTarget) {
    const focalCoords = {
      x: (aspectWidth * focal.x) - pos.left,
      y: (aspectHeight * focal.y) - pos.top
    }

    const crossHairs = drawCrosshairs(
      {width: aspectWidth, height: aspectHeight},
      focalCoords,
      params.dpr
    )

    params.overlays = params.overlays || []
    params.overlays.push(crossHairs)
  }

  tr.extract(crop)

  const outputSize = opts.getOutputSize({sizeMode: 'crop'})
  const constrained = opts.constrain(outputSize)

  params.outputSize = Object.assign({}, constrained, {
    width: crop.width,
    height: crop.height
  })
}

function fitMin(tr, params, meta, opts) {
  params.outputSize = opts.constrain(opts.getOutputSize({sizeMode: 'simple'}))

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

function fitGravityCrop(tr, params, meta, opts) {
  const cropType = typeof params.crop === 'string'
    ? sharp.strategy[params.crop]
    : params.crop

  const {width, height} = getNewSizeForAspectRatio(params, meta)
  const targetWidth = clamp(width, params.minWidth, Math.min(params.maxSize, params.maxWidth))
  const targetHeight = clamp(height, params.minHeight, Math.min(params.maxSize, params.maxHeight))

  tr
    .resize(targetWidth, targetHeight)
    .crop(cropType || 'center')

  params.outputSize = round(getOutputSize(params, meta, {
    sizeMode: params.width && params.height ? 'ignoreAspectRatio' : 'crop'
  }))
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

function orientation(tr, params) {
  // Auto-rotate by EXIF if no rotation is explicitly set
  if (isDefined(params.orientation)) {
    tr.rotate(params.orientation)
  } else {
    tr.rotate()
  }
}

function background(tr, params, meta) {
  if (params.backgroundColor) {
    tr.background(params.backgroundColor).flatten()
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

function output(tr, params, meta) {
  const out = params.output || {}
  const format = out.format || meta.format || 'jpeg'
  const options = {}

  if (params.quality && format !== 'png') {
    options.quality = params.quality || 75
  }

  if (out.progressive && format !== 'webp') {
    options.progressive = true
  }

  if (out.format || params.quality) {
    tr.toFormat(format, options)
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

    const newSize = getNewSizeForAspectRatio({width, height}, meta)
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

function getNewSizeForAspectRatio(target, original) {
  const newSize = Object.assign({}, target)

  if (target.width && target.height) {
    return newSize
  } else if (target.width) {
    newSize.height = Math.round((target.width * original.height) / original.width)
  } else {
    newSize.width = Math.round((target.height * original.width) / original.height)
  }

  return newSize
}

function constrainOriginal(tr, params, meta) {
  if (params.width || params.height) {
    // Expect us to already be constrained
    return
  }

  const out = params.outputSize
  const max = params.maxSize

  // Do we need to be constrained?
  if (!out || (out.width < max && out.height < max)) {
    return
  }

  // Resize by aspect ratio
  const isLandscape = out.width > out.height
  if (isLandscape && out.width > max) {
    tr.resize(max)
  } else if (out.height > max) {
    tr.resize(undefined, max)
  }
}

function isDefined(thing) {
  return typeof thing !== 'undefined'
}

function sizeFromParams(params, size) {
  return [
    isDefined(params.width) ? size.width : undefined,
    isDefined(params.height) ? size.height : undefined
  ]
}

module.exports = getTransformer
