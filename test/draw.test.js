const test = require('tape')
const drawCrosshairs = require('../src/draw/drawCrosshairs')

test('[draw] can draw crosshairs', t => {
  const width = 429
  const height = 311
  const x = 400
  const y = 107
  const svg = drawCrosshairs({width, height}, {x, y})

  t.include(svg, `width="${width}"`)
  t.include(svg, `height="${height}"`)
  t.include(svg, `viewBox="0 0 ${width} ${height}"`)
  t.include(svg, `M0 ${y}h${width}M${x} 0v${height}`)
  t.end()
})
