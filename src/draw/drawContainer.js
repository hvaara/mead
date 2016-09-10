module.exports = (imgSize, overlays) => {
  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${imgSize.width}"
    height="${imgSize.height}"
    viewBox="0 0 ${imgSize.width} ${imgSize.height}">
    ${overlays.join('\n\n')}
  </svg>`
}
