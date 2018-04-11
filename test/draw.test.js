const drawCrosshairs = require('../src/draw/drawCrosshairs')
const drawBorder = require('../src/draw/drawBorder')
const drawContainer = require('../src/draw/drawContainer')

jest.setTimeout(15000)

const width = 429
const height = 311

test('[draw] can draw crosshairs', () => {
  const x = 400
  const y = 107
  const svg = drawCrosshairs({width, height}, {x, y})

  expect(svg).toContain(`M0 ${y}h${width}M${x} 0v${height}`)
})

test('[draw] can draw border', () => {
  const size = 6
  const color = '#bf1942'
  const svg = drawBorder({width, height}, size, color)

  expect(svg).toContain(`width="${width - size}"`)
  expect(svg).toContain(`x="${size / 2}"`)
  expect(svg).toContain(`stroke="${color.toUpperCase()}"`)
  expect(svg).toContain('stroke-opacity="1"')
  expect(svg).toContain(`stroke-width="${size}"`)
})

test('[draw] can draw border with opacity', () => {
  const size = 5
  const color = {r: 255, g: 123, b: 18, alpha: 0.51}
  const svg = drawBorder({width, height}, size, color)

  expect(svg).toContain(`width="${width - size}"`)
  expect(svg).toContain(`x="${size / 2}"`)
  expect(svg).toContain('stroke="#FF7B12"')
  expect(svg).toContain('stroke-opacity="0.51"')
  expect(svg).toContain(`stroke-width="${size}"`)
})

test('[draw] can draw overlay-container', () => {
  const border = drawBorder({width, height}, 5, '#bf1942')
  const crosshairs = drawCrosshairs({width, height}, {x: 10, y: 150})
  const svg = drawContainer({width, height}, [border, crosshairs])

  expect(svg).toContain(border)
  expect(svg).toContain(crosshairs)
  expect(svg).toContain(`width="${width}"`)
  expect(svg).toContain(`height="${height}"`)
  expect(svg).toContain(`viewBox="0 0 ${width} ${height}"`)
})
