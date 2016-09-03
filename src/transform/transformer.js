const sharp = require('sharp')
const pipeline = [quality, size, rotation, background, flip, output]

function getTransformer(params) {
  const tr = sharp()
  pipeline.forEach(mod => mod(tr, params))
  return tr
}

function quality(tr, params) {
  tr.quality(params.quality || 75)
}

function size(tr, params) {
  if (params.width || params.height) {
    tr.resize(params.width, params.height)
  }
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

module.exports = getTransformer
