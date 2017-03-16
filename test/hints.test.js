const test = require('tape')
const request = require('supertest')
const {appify, assertSize} = require('./helpers')

const mead = appify()

test('[hints] save-data actually saves data', t => {
  const sizes = {}
  mead.then(server => {
    request(server)
      .get('/foo/images/trim.jpg?ch=Save-Data,Width')
      .expect(200)
      .expect('Vary', 'Save-Data,Width')
      .expect(res => Object.assign(sizes, {normal: res.body.length}))
      .end(whenDone)

    request(server)
      .get('/foo/images/trim.jpg?ch=Save-Data,Width')
      .set('Save-Data', 'on')
      .expect(200)
      .expect('Vary', 'Save-Data,Width')
      .expect(res => Object.assign(sizes, {saveData: res.body.length}))
      .end(whenDone)
  })

  function whenDone(err, res) {
    if (err) {
      t.fail(err)
      t.end()
      return
    }

    const {saveData, normal} = sizes
    if (!(saveData && normal)) {
      return
    }

    t.ok(saveData < normal, 'save-data body should be smaller')
    t.end()
  }
})

test('[hints] dpr hint adjusts width', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {DPR: 2},
    resHeaders: {'Content-DPR': '2'},
    query: {w: 300, ch: 'DPR'}
  }, {width: 600, height: 450}, t)
})

test('[hints] dpr hint does not override explicit dpr parameter', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {DPR: 2},
    query: {w: 300, dpr: 3, ch: 'Viewport-Width,Width,DPR,Save-Data'}
  }, {width: 900, height: 675}, t)
})

test('[hints] width hint adjusts width', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {Width: 133},
    query: {ch: 'Width,Viewport-Width'}
  }, {width: 133}, t)
})

test('[hints] width hint does not override explicit width parameter', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {Width: 133},
    query: {w: 300, ch: 'Viewport-Width,Width,DPR,Save-Data'}
  }, {width: 300}, t)
})

test('[hints] width hint does not override explicit height parameter', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {Width: 133},
    query: {h: 450, ch: 'Viewport-Width,Width,DPR,Save-Data'}
  }, {width: 600, height: 450}, t)
})

test('[hints] viewport-width hint adjusts width according to scale factor (config)', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {'Viewport-Width': 133},
    query: {ch: 'Save-Data,Viewport-Width'}
  }, {width: 266}, t)
})

test('[hints] viewport-width hint does not override explicit width parameter', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {'Viewport-Width': 133},
    query: {w: 300, ch: 'Save-Data,Viewport-Width'}
  }, {width: 300}, t)
})

test('[hints] width hint does not override explicit height parameter', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {'Viewport-Width': 133},
    query: {h: 450, ch: 'Save-Data,Viewport-Width'}
  }, {width: 600, height: 450}, t)
})

// Note: Width header is provided "correctly" from the server, so when the client
// asks for an image with a width of 399 and also provides a DPR of 3, that still
// means that the image should be 399 pixels wide. This is different than the behaviour
// when a plain `w` and `dpr` query param is provided, which can be confusing.
test('[hints] width hint adjusts width correctly when DPR is provided', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {Width: 399, DPR: 3},
    query: {ch: 'Width,Viewport-Width,DPR'}
  }, {width: 399}, t)
})

test('[hints] viewport-width hint adjusts width to scale factor when DPR is provided', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    headers: {'Viewport-Width': 500, DPR: 2},
    query: {ch: 'Save-Data,Viewport-Width,DPR'}
  }, {width: 1000}, t)
})
