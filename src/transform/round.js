// Note: mutates input
module.exports = function round(size) {
  for (const key in size) {
    size[key] = Math.round(size[key])
  }

  return size
}
