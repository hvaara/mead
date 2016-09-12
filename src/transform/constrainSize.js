const round = require('./round')

function constrainSize(max, original, targetSize) {
  const target = {width: targetSize.width, height: targetSize.height}
  const widthOverLimit = target.width > max
  const heightOverLimit = target.height > max

  // Do we need to constrain it?
  if (!widthOverLimit && !heightOverLimit) {
    return round(target)
  }

  // Both width and height are larger than our max
  if (widthOverLimit && heightOverLimit) {
    return constrainBoth(max, original, targetSize)
  }

  // Only constrain width
  if (widthOverLimit) {
    return constrainWidth(max, original, targetSize)
  }

  // Only constrain height
  return constrainHeight(max, original, targetSize)
}

function constrainBoth(max, original, target) {
  const isLandscape = target.width > target.height
  const scale = isLandscape
    ? target.width / max
    : target.height / max

  return round({
    width: isLandscape ? max : target.width / scale,
    height: isLandscape ? target.height / scale : max
  })
}

function constrainWidth(max, original, target) {
  return resize(target, {width: max})
}

function constrainHeight(max, original, target) {
  return resize(target, {height: max})
}

function resize(original, target) {
  const newSize = Object.assign({}, target)

  if (target.width) {
    newSize.height = (target.width * original.height) / original.width
  } else {
    newSize.width = (target.height * original.width) / original.height
  }

  return round(newSize)
}

module.exports = constrainSize
