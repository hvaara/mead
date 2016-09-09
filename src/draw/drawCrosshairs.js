module.exports = (size, focal) => {
  const {width, height} = size
  const {x, y} = focal

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}">
      <path
        fill="none"
        stroke="red"
        d="M0 ${y}h${width}M${x} 0v${height}"
      />
  </svg>`
}
