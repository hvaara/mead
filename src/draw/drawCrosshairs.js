module.exports = (size, focal) => {
  const {width, height} = size
  const {x, y} = focal

  return `
    <path
      fill="none"
      stroke="red"
      d="M0 ${y}h${width}M${x} 0v${height}"
    />
  `
}
