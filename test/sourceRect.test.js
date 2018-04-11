const {readImage} = require('./helpers')

jest.setTimeout(15000)

test('[sourceRect] uses the passed source rect as input', done => {
  readImage('landscape.png?rect=384,243,768,486').then(img => {
    expect(img.width).toBe(768)
    expect(img.height).toBe(486)
    expect(img.colorAt(0, 0)).toBe('1faf60')
    done()
  })
})

test('[sourceRect] scales passed source rect', done => {
  readImage('landscape.png?rect=384,243,768,486&crop=bottom,right&w=384&h=384&fit=crop').then(img => {
    expect(img.width).toBe(384)
    expect(img.height).toBe(384)
    img.colorAtIsApprox(16, 16, '27ae60')
    img.colorAtIsApprox(383, 16, '2980b9')
    img.colorAtIsApprox(16, 383, 'e67e22')
    img.colorAtIsApprox(383, 383, 'e74c3c')
    done()
  })
})

test('[sourceRect] scales passed source rect with focal point', done => {
  readImage('landscape.png?rect=384,243,768,486&crop=focalpoint&w=384&h=243&fit=crop&fp-x=0.25&fp-y=0.75').then(img => {
    expect(img.width).toBe(384)
    expect(img.height).toBe(243)
    img.colorAtIsApprox(0, 0, '27ae60')
    img.colorAtIsApprox(380, 0, '2980b9')
    img.colorAtIsApprox(0, 240, 'e67e22')
    img.colorAtIsApprox(380, 240, 'e74c3c')
    done()
  })
})

test('[sourceRect] pairs with resize', done => {
  readImage('200x300.png?rect=15,0,90,300&w=30').then(img => {
    expect(img.width).toBe(30)
    expect(img.height).toBe(100)
    done()
  })
})
