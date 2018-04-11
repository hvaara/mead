const {readImage} = require('./helpers')

jest.setTimeout(15000)

test('[flip] can flip an image horizontally', done => {
  readImage('small-landscape.png?flip=h').then(img => {
    expect(img.width).toBe(367)
    expect(img.height).toBe(153)
    expect(img.colorAt(0, 0)).toBe('36495e')
    done()
  })
})

test('[flip] can flip an image vertically', done => {
  readImage('small-landscape.png?flip=v').then(img => {
    expect(img.width).toBe(367)
    expect(img.height).toBe(153)
    expect(img.colorAt(0, 0)).toBe('f59b07')
    done()
  })
})

test('[flip] can flip an image horizontally and vertically', done => {
  readImage('small-landscape.png?flip=hv').then(img => {
    expect(img.width).toBe(367)
    expect(img.height).toBe(153)
    expect(img.colorAt(0, 0)).toBe('808c8d')
    done()
  })
})

test('[orientation] can change orientation of image', done => {
  readImage('small-landscape.png?or=90').then(img => {
    expect(img.width).toBe(153)
    expect(img.height).toBe(367)
    expect(img.colorAt(0, 0)).toBe('f59b07')
    done()
  })
})

for (let i = 1; i <= 8; i++) {
  test(`[orientation] auto-adjusts orientation ${i} for exif-rotated images`, done => {
    readImage(`orientation${i}.jpg`).then(img => {
      img.colorAtIsApprox(23, 23, '803fc1')
      done()
    })
  })
}
