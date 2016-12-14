const test = require('tape')
const drawCrosshairs = require('../src/draw/drawCrosshairs')
const drawBorder = require('../src/draw/drawBorder')
const drawContainer = require('../src/draw/drawContainer')

const width = 429
const height = 311

test('[draw] can draw crosshairs', t => {
  const x = 400
  const y = 107
  const svg = drawCrosshairs({width, height}, {x, y})

  t.include(svg, `M0 ${y}h${width}M${x} 0v${height}`)
  t.end()
})

test('[draw] can draw border', t => {
  const size = 6
  const color = '#bf1942'
  const svg = drawBorder({width, height}, size, color)

  t.include(svg, `width="${width - size}"`, 'width')
  t.include(svg, `x="${size / 2}"`, 'x')
  t.include(svg, `stroke="${color.toUpperCase()}"`, 'stroke color')
  t.include(svg, 'stroke-opacity="1"', 'stroke opacity')
  t.include(svg, `stroke-width="${size}"`, 'stroke width')
  t.end()
})

test('[draw] can draw border with opacity', t => {
  const size = 5
  const color = {r: 255, g: 123, b: 18, alpha: 0.51}
  const svg = drawBorder({width, height}, size, color)

  t.include(svg, `width="${width - size}"`, 'width')
  t.include(svg, `x="${size / 2}"`, 'x')
  t.include(svg, 'stroke="#FF7B12"', 'stroke color')
  t.include(svg, 'stroke-opacity="0.51"', 'stroke opacity')
  t.include(svg, `stroke-width="${size}"`, 'stroke width')
  t.end()
})

test('[draw] can draw overlay-container', t => {
  const border = drawBorder({width, height}, 5, '#bf1942')
  const crosshairs = drawCrosshairs({width, height}, {x: 10, y: 150})
  const svg = drawContainer({width, height}, [border, crosshairs])

  t.include(svg, border, 'includes border')
  t.include(svg, crosshairs, 'includes crosshairs')
  t.include(svg, `width="${width}"`, 'container width')
  t.include(svg, `height="${height}"`, 'container height')
  t.include(svg, `viewBox="0 0 ${width} ${height}"`, 'container viewbox')
  t.end()
})
