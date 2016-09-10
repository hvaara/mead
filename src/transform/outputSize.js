function getInitialOutputParams(params, meta) {
  return {
    width: params.width,
    height: params.height,
    xFactor: 1,
    yFactor: 1
  }
}

function getOutputParamsFromExactSize(out, params, meta, sizeMode) {
  out.xFactor = meta.width / params.width
  out.yFactor = meta.height / params.height

  if (sizeMode === 'crop') {
    if (out.xFactor < out.yFactor) {
      out.height = Math.round(meta.height / out.xFactor)
      out.yFactor = out.xFactor
    } else {
      out.width = Math.round(meta.width / out.yFactor)
      out.xFactor = out.yFactor
    }
  } else if (sizeMode === 'embed') {
    if (out.xFactor > out.yFactor) {
      out.yFactor = out.xFactor
    } else {
      out.xFactor = out.yFactor
    }

    out.width = params.width
    out.height = params.height
  } else if (sizeMode === 'max') {
    if (out.xFactor > out.yFactor) {
      out.height = Math.round(meta.height / out.xFactor)
      out.yFactor = out.xFactor
    } else {
      out.width = Math.round(meta.width / out.yFactor)
      out.xFactor = out.yFactor
    }
  } else if (sizeMode === 'min') {
    if (out.xFactor < out.yFactor) {
      out.height = Math.round(meta.height / out.xFactor)
      out.yFactor = out.xFactor
    } else {
      out.width = Math.round(meta.width / out.yFactor)
      out.xFactor = out.yFactor
    }
  }

  return out
}

function getOutputParamsFromWidth(out, params, meta, sizeMode) {
  out.xFactor = meta.width / params.width

  if (sizeMode === 'ignoreAspect') {
    out.height = meta.height
  } else {
    out.yFactor = out.xFactor
    out.height = meta.height / out.yFactor
  }

  return out
}

function getOutputParamsFromHeight(out, params, meta, sizeMode) {
  out.yFactor = meta.height / params.height

  if (sizeMode === 'ignoreAspect') {
    out.width = meta.width
  } else {
    out.xFactor = out.yFactor
    out.width = meta.width / out.xFactor
  }

  return out
}

function getOutputParamsInSimpleMode(out, params, meta) {
  const {width, height} = params
  if (width && height) {
    return Object.assign(out, {width, height})
  }

  if (width) {
    return Object.assign(out, {width, height: width / (meta.width / meta.height)})
  }

  return Object.assign(out, {width: height * (meta.width / meta.height), height})
}

module.exports = function getOutputSize(params, meta, opts = {}) {
  let out = getInitialOutputParams(params, meta)

  if (opts.sizeMode === 'simple') {
    out = getOutputParamsInSimpleMode(out, params, meta)
  } else if (params.width && params.height) {
    out = getOutputParamsFromExactSize(out, params, meta, opts.sizeMode)
  } else if (params.width) {
    out = getOutputParamsFromWidth(out, params, meta, opts.sizeMode)
  } else if (params.height) {
    out = getOutputParamsFromHeight(out, params, meta, opts.sizeMode)
  } else {
    out.width = meta.width
    out.height = meta.height
  }

  if (opts.withoutEnlargement && (meta.width < out.width || meta.height < out.height)) {
    out.xFactor = 1
    out.yFactor = 1
    out.width = meta.width
    out.height = meta.height
  }

  return out
}
