const Color = require('color')

module.exports = (imgSize, size, clr) => {
  const color = Color(clr)

  return `
    <rect
      width="${imgSize.width - size}"
      height="${imgSize.height - size}"
      x="${size / 2}"
      y="${size / 2}"
      fill="none"
      stroke="${color.hex()}"
      stroke-opacity="${color.alpha()}"
      stroke-width="${size}"
    />
  `
}
