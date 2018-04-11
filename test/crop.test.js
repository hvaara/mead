const {readImage} = require('./helpers')

jest.setTimeout(15000)

const modes = [
  ['top,left', 10, 10, '1abc9c'],
  ['top,right', 299, 10, '34495e'],
  ['bottom,left', 10, 299, 'f39c12'],
  ['bottom,right', 299, 299, '7f8c8d'],
  ['center', 150, 170, 'e74c3c'],
  ['center,center', 150, 170, 'e74c3c'],
]

modes.forEach(mode => {
  const [gravity, x, y, color] = mode
  test(`[crop] can crop with gravity ${gravity}`, done => {
    readImage(`landscape.png?w=300&h=300&fit=crop&crop=${gravity}`).then(img => {
      expect(img.width).toBe(300)
      expect(img.height).toBe(300)
      img.colorAtIsApprox(x, y, color, 30)
      done()
    }).catch(done)
  })
})
