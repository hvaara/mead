const test = require('tape')
const {readImage} = require('./helpers')

test('[transforms] invert colors', t => {
  readImage('small-landscape.png?invert=1').then(img => {
    t.equal(img.width, 367, 'correct width')
    t.equal(img.height, 153, 'correct height')
    t.equal(img.colorAt(0, 0), 'ff4261', 'correct color')
    t.end()
  })
})

test('[transforms] border image (inlaid)', t => {
  readImage('mead.png?border=10,bf1942').then(img => {
    t.equal(img.width, 512, 'correct width')
    t.equal(img.height, 512, 'correct height')
    t.equal(img.colorAt(0, 0), 'bf1942', 'correct color')
    t.end()
  })
})

test('[transforms] border image with alpha (inlaid)', t => {
  readImage('mead.png?border=10,ccbf1942').then(img => {
    t.equal(img.width, 512, 'correct width')
    t.equal(img.height, 512, 'correct height')
    t.equal(img.colorAt(0, 0), 'bf1942', 'correct color')
    t.end()
  })
})

test('[transforms] pad image', t => {
  readImage('mead.png?bg=bf1942&pad=10').then(img => {
    t.equal(img.width, 532, 'correct width')
    t.equal(img.height, 532, 'correct height')
    t.equal(img.colorAt(0, 0), 'bf1942', 'correct color')
    t.end()
  })
})

test('[transforms] pad image combined with width adjustment', t => {
  readImage('mead.png?bg=bf1942&pad=10&w=256').then(img => {
    t.equal(img.width, 256, 'correct width')
    t.equal(img.height, 256, 'correct height')
    t.equal(img.colorAt(0, 0), 'bf1942', 'correct color')
    t.equal(img.colorAt(128, 128), '000000', 'correct color')
    t.end()
  })
})

test('[transforms] draws focal point debugger', t => {
  readImage('mead.png?fp-y=0.75&fp-x=.25&fp-debug=1&fit=crop').then(img => {
    img.colorAtIsApprox(128, 384, 'c00000', t)
    t.end()
  })
})
