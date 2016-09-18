const test = require('tape')
const {readImage} = require('./helpers')

test('[trim] can trim an image using auto mode', t => {
  readImage('trim.jpg?trim=auto').then(img => {
    t.equal(img.width, 1024, 'correct width')
    t.ok(img.height <= 592, 'height acceptable')
    t.end()
  })
})

test('[trim] can trim an image using color mode', t => {
  readImage('trim.jpg?trim=color').then(img => {
    t.equal(img.width, 1024, 'correct width')
    t.ok(img.height <= 592, 'height acceptable')
    t.end()
  })
})

test('[trim] can trim with increased tolerance', t => {
  readImage('trim.jpg?trim=color&trimtol=25').then(img => {
    t.equal(img.width, 1024, 'correct width')
    t.ok(img.height <= 585, 'height acceptable')
    t.end()
  })
})
