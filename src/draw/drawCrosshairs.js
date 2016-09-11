module.exports = (size, focal, dpr = 1) => {
  const {width, height} = size
  const {x, y} = focal

  return `
    <path
      fill="none"
      stroke="red"
      stroke-width="${1 * dpr}"
      d="M0 ${y}h${width}M${x} 0v${height}"
    />
  `
}
