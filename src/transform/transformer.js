const sharp = require('sharp')
const validate = require('./validate')

function getTransformer(req, res) {
  let params
  try {
    params = validate(req.query)
  } catch (err) {
    return err
  }

  const tr = sharp()

  tr.quality(params.quality || 75)

  if (params.width || params.height) {
    tr.resize(params.width, params.height)
  }

  // Auto-rotate by EXIF if no rotation is explicitly set
  if (typeof params.rotation === 'undefined') {
    tr.rotate()
  } else {
    tr.rotate(params.rotation)
  }

  if (params.backgroundColor) {
    // @todo Might have to call flatten or similar if going from gif/png
    // to jpeg, in order for the background color to apply
    tr.background(params.backgroundColor)
  }

  if (params.flip) {
    if (params.flip.includes('v')) {
      tr.flip()
    }

    if (params.flip.includes('h')) {
      tr.flop()
    }
  }

  if (params.output) {
    res.setHeader('Content-Type', params.output.mime)
    tr.toFormat(params.output.format)

    if (params.output.progressive) {
      tr.progressive()
    }
  }

  return tr
}

module.exports = getTransformer
