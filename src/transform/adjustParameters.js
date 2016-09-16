module.exports = (params, meta, config) => {
  applyMaxSize(params, config)
  applyDpr(params)
  return params
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
