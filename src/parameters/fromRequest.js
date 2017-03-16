const path = require('path')

const availableHints = ['Save-Data', 'Viewport-Width', 'Width', 'DPR']

const pipeline = [
  applyClientHints,
  applyMaxSize,
  forceFormat,
]

module.exports = (request, params, config) => {
  pipeline.forEach(operation => operation(params, config, request))
  return params
}

function forceFormat(params, config, request) {
  if (!config.images.forceToFilenameFormat) {
    return
  }

  if (params.output && params.output.format) {
    return
  }

  const extension = path.extname(request.params['0']).replace(/^\./, '').replace('jpg', 'jpeg')
  if (!extension) {
    return
  }

  const formatMap = config.inputFormatMap || {}
  const hasAlpha = extension !== 'jpeg'
  const outputFormat = formatMap[extension] || (hasAlpha ? 'png' : 'jpeg')

  params.output = {
    format: outputFormat,
    mime: `image/${outputFormat}`,
    progressive: false
  }
}

function applyClientHints(params, config, request) {
  const hintOptions = config.clientHints
  if (!hintOptions || !hintOptions.enabled) {
    return
  }

  const hints = getHintsFromRequest(params, request, hintOptions)

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

function getHintsFromRequest(params, request, options) {
  const headers = request.headers
  const enabled = (options.optIn ? params.clientHints : availableHints) || []
  if (enabled.length > 0) {
    params.responseHeaders.Vary = [].concat(params.responseHeaders.Vary || [], enabled)
  }

  const hints = {}
  for (let i = 0, hint; hint = enabled[i]; i++) {
    hint = hint.toLowerCase()
    hints[hint] = headers[hint]
  }

  return hints
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

function applyMaxSize(params, config, request) {
  params.maxSize = config.images.maxSize
}
