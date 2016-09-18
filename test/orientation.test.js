const test = require('tape')
const {readImage} = require('./helpers')

test('[flip] can flip an image horizontally', t => {
  readImage('small-landscape.png?flip=h').then(img => {
    t.equal(img.width, 367, 'correct width')
    t.equal(img.height, 153, 'correct height')
    t.equal(img.colorAt(0, 0), '36495e', 'correct color')
    t.end()
  })
})

test('[flip] can flip an image vertically', t => {
  readImage('small-landscape.png?flip=v').then(img => {
    t.equal(img.width, 367, 'correct width')
    t.equal(img.height, 153, 'correct height')
    t.equal(img.colorAt(0, 0), 'f59b07', 'correct color')
    t.end()
  })
})

test('[flip] can flip an image horizontally and vertically', t => {
  readImage('small-landscape.png?flip=hv').then(img => {
    t.equal(img.width, 367, 'correct width')
    t.equal(img.height, 153, 'correct height')
    t.equal(img.colorAt(0, 0), '808c8d', 'correct color')
    t.end()
  })
})

test('[orientation] can change orientation of image', t => {
  readImage('small-landscape.png?or=90').then(img => {
    t.equal(img.width, 153, 'correct width')
    t.equal(img.height, 367, 'correct height')
    t.equal(img.colorAt(0, 0), 'f59b07', 'correct color')
    t.end()
  })
})

for (let i = 1; i <= 8; i++) {
  test(`[orientation] auto-adjusts orientation ${i} for exif-rotated images`, t => {
    readImage(`orientation${i}.jpg`).then(img => {
      img.colorAtIsApprox(23, 23, '803fc1', t)
      t.end()
    })
  })
}
