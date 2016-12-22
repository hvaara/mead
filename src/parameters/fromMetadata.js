const ValidationError = require('../errors/validationError')

const pipeline = [
  validateSourceRectCoords,
  fractionParamsToPixels,
  mapOutputFormat,
]

module.exports = (params, meta, config) => {
  pipeline.forEach(operation => operation(params, meta, config))
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

function mapOutputFormat(params, meta, config) {
  // If the user has explicitly defined a format, skip
  const format = params.output && params.output.format
  if (format) {
    return
  }

  // If we have defined a mapping of input => output formats,
  // see if we should rework this format
  const outputFormat = config.inputFormatMap && config.inputFormatMap[meta.format]
  if (outputFormat) {
    params.output = Object.assign(params.output || {}, {
      format: outputFormat,
      mime: `image/${outputFormat}`
    })
  }
}
