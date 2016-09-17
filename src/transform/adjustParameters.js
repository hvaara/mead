const ValidationError = require('../errors/validationError')

const availableHints = ['Save-Data', 'Viewport-Width', 'Width', 'DPR']

const pipeline = [
  validateSourceRectCoords,
  fractionParamsToPixels,
  applyClientHints,
  applyMaxSize,
  applyDpr,
]

module.exports = (params, meta, config, headers) => {
  pipeline.forEach(operation => operation(params, meta, config, headers))
  return params
}

function fractionParamsToPixels(params, meta) {
  if (params.width && params.width <= 1) {
    params.width *= meta.width
  }

  if (params.height && params.height <= 1) {
    params.height *= meta.height
  }
}

function applyClientHints(params, meta, config, headers) {
  const hintOptions = config.clientHints
  if (!hintOptions || !hintOptions.enabled) {
    return
  }

  const enabled = (hintOptions.optIn ? params.clientHints : availableHints) || []
  params.responseHeaders.Vary = [].concat(params.responseHeaders.Vary || [], enabled)

  const hints = {}
  for (let i = 0, hint; hint = enabled[i]; i++) {
    hint = hint.toLowerCase()
    hints[hint] = headers[hint]
  }

  if (hints['save-data']) {
    params.quality = params.quality ? Math.min(params.quality, 60) : 60
  }

  const useDpr = hints.dpr && params.dpr === 1
  if (useDpr) {
    params.dpr = hints.dpr
    params.responseHeaders['Content-DPR'] = hints.dpr
  }

  applyWidthFromHints(params, hints, hintOptions, useDpr)
}

function applyWidthFromHints(params, hints, hintOptions, useDpr) {
  const hasDimensions = params.width || params.height
  if (hasDimensions) {
    return
  }

  // Note: DPR is applied at a later stage, but width/viewport-width
  // specifies width in physical pixels - in other words, we need actually
  // scale the width down before it gets scaled up again later
  // (I know, this should probably be handled somewhat differently)
  const dpr = useDpr ? hints.dpr : 1
  if (hints.width) {
    params.width = hints.width / dpr
  } else if (hints['viewport-width'] && hintOptions.viewportScale) {
    params.width = (hints['viewport-width'] * hintOptions.viewportScale) / dpr
  }
}

function applyMaxSize(params, meta, config, headers) {
  params.maxSize = config.images.maxSize
}

function applyDpr(params, meta, config, headers) {
  const dpr = params.dpr
  if (dpr === 1) {
    return
  }

  if (params.width) {
    params.width *= dpr
  }

  if (params.height) {
    params.height *= dpr
  }

  if (params.pad) {
    params.pad *= dpr
  }

  if (params.border) {
    params.border.size *= dpr
  }
}

function validateSourceRectCoords(params, meta, config, headers) {
  const rect = params.sourceRectangle
  if (!rect) {
    return
  }

  const [left, top, width, height] = rect
  if (left + width > meta.width || top + height > meta.height) {
    throw new ValidationError('Source rectangle coordinates out of bounds')
  }
}

