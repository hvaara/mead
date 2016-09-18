const ValidationError = require('../errors/validationError')

const pipeline = [
  validateSourceRectCoords,
  fractionParamsToPixels,
]

module.exports = (params, meta) => {
  pipeline.forEach(operation => operation(params, meta))
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

function fractionParamsToPixels(params, meta) {
  if (params.width && params.width <= 1) {
    params.width *= meta.width
  }

  if (params.height && params.height <= 1) {
    params.height *= meta.height
  }
}
