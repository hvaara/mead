const pipeline = [quality, size, fit, rotation, background, flip, output]

function getTransformer(tr, params, meta) {
  pipeline.forEach(mod => mod(tr, params, meta))
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

function fit(tr, params, meta) {
  if (!params.fit) {
    return tr.max()
  }

  switch (params.fit) {
    case 'crop':
      return tr
    case 'fill':
      return tr.embed()
    case 'fillmax':
      return extendToSize(tr.withoutEnlargement(), params, meta)
    case 'max':
      return tr.withoutEnlargement().max()
    case 'min':
      return cropToCenter(tr.withoutEnlargement(), params, meta)
    case 'scale':
      return tr.ignoreAspectRatio()
    case 'clip':
    default:
      return tr.max()
  }
}

function cropToCenter(tr, params, meta) {
  const targetAspect = params.width / params.height

  const width = Math.min(params.width || +Infinity, meta.width)
  const height = Math.min(params.height || +Infinity, meta.height)
  const isLandscape = width > height

  let targetWidth = Math.round(isLandscape ? width : height * targetAspect)
  let targetHeight = Math.round(isLandscape ? width / targetAspect : height)

  if (targetHeight > meta.height) {
    targetHeight = meta.height
    targetWidth = Math.round(meta.height * targetAspect)
  }

  tr.resize(targetWidth, targetHeight)
  tr.crop()

  return tr
}

function extendToSize(tr, params, meta) {
  const aspect = meta.width / meta.height

  const width = Math.min(params.width || +Infinity, meta.width)
  const height = Math.min(params.height || +Infinity, meta.height)

  const targetWidth = params.width || (params.height * aspect)
  const targetHeight = params.height || (params.width / aspect)

  const addWidth = (targetWidth - width) / 2
  const addHeight = (targetHeight - height) / 2

  tr.extend({
    top: Math.ceil(addHeight),
    bottom: Math.floor(addHeight),
    left: Math.ceil(addWidth),
    right: Math.floor(addWidth)
  })

  return tr
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
