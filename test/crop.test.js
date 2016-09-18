const test = require('tape')
const {readImage} = require('./helpers')

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
  test(`[crop] can crop with gravity ${gravity}`, t => {
    readImage(`landscape.png?w=300&h=300&fit=crop&crop=${gravity}`).then(img => {
      t.equal(img.width, 300, 'correct width')
      t.equal(img.height, 300, 'correct height')
      img.colorAtIsApprox(x, y, color, t, 30)
      t.end()
    })
  })
})
