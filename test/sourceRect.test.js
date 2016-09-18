const test = require('tape')
const {readImage} = require('./helpers')

test('[sourceRect] uses the passed source rect as input', t => {
  readImage('landscape.png?rect=384,243,768,486').then(img => {
    t.equal(img.width, 768, 'correct width')
    t.equal(img.height, 486, 'correct height')
    t.equal(img.colorAt(0, 0), '1faf60', 'correct color')
    t.end()
  })
})

test('[sourceRect] scales passed source rect', t => {
  readImage('landscape.png?rect=384,243,768,486&crop=bottom,right&w=384&h=384&fit=crop').then(img => {
    t.equal(img.width, 384, 'correct width')
    t.equal(img.height, 384, 'correct height')
    img.colorAtIsApprox(16, 16, '27ae60', t)
    img.colorAtIsApprox(383, 16, '2980b9', t)
    img.colorAtIsApprox(16, 383, 'e67e22', t)
    img.colorAtIsApprox(383, 383, 'e74c3c', t)
    t.end()
  })
})

test('[sourceRect] scales passed source rect with focal point', t => {
  readImage('landscape.png?rect=384,243,768,486&crop=focalpoint&w=384&h=243&fit=crop&fp-x=0.25&fp-y=0.75').then(img => {
    t.equal(img.width, 384, 'correct width')
    t.equal(img.height, 243, 'correct height')
    img.colorAtIsApprox(0, 0, '27ae60', t)
    img.colorAtIsApprox(380, 0, '2980b9', t)
    img.colorAtIsApprox(0, 240, 'e67e22', t)
    img.colorAtIsApprox(380, 240, 'e74c3c', t)
    t.end()
  })
})
