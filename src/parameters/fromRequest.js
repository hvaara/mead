const availableHints = ['Save-Data', 'Viewport-Width', 'Width', 'DPR']

const pipeline = [
  applyClientHints,
  applyMaxSize,
]

module.exports = (request, params, config) => {
  pipeline.forEach(operation => operation(params, config, request))
  return params
}

function applyClientHints(params, config, request) {
  const headers = request.headers
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

function applyMaxSize(params, config, request) {
  params.maxSize = config.images.maxSize
}
