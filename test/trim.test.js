const {readImage} = require('./helpers')

test('[trim] can trim an image using auto mode', done => {
  readImage('trim.jpg?trim=auto').then(img => {
    expect(img.width).toBe(1024)
    expect(img.height <= 592).toBeTruthy()
    done()
  })
})

test('[trim] can trim an image using color mode', done => {
  readImage('trim.jpg?trim=color').then(img => {
    expect(img.width).toBe(1024)
    expect(img.height <= 592).toBeTruthy()
    done()
  })
})

test('[trim] can trim with increased tolerance', done => {
  readImage('trim.jpg?trim=color&trimtol=25').then(img => {
    expect(img.width).toBe(1024)
    expect(img.height <= 585).toBeTruthy()
    done()
  })
})
