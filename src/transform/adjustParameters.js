const ValidationError = require('../errors/validationError')

module.exports = (params, meta, config) => {
  applyMaxSize(params, config)
  applyDpr(params)
  validateSourceRectCoords(params, meta)
  return params
}

function validateSourceRectCoords(params, meta) {
  const rect = params.sourceRectangle
  if (!rect) {
    return
  }

  const [left, top, width, height] = rect
  if (left + width > meta.width || top + height > meta.height) {
    throw new ValidationError('Source rectangle coordinates out of bounds')
  }
}

function applyMaxSize(params, config) {
  params.maxSize = config.images.maxSize
  return params
}

function applyDpr(params) {
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
