const pipeline = [
  applyDpr
]

module.exports = params => {
  pipeline.forEach(operation => operation(params))
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

  if (params.minimumInputSize) {
    params.minimumInputSize.width *= dpr
    params.minimumInputSize.height *= dpr
  }
}
