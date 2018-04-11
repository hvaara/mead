const {appify, assertSize} = require('./helpers')

jest.setTimeout(15000)

const mead = appify()

test('[dpr] dpr of 1 uses provided width', done => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {w: 300, dpr: 1}
  }, {width: 300, height: 225}, done)
})

test('[dpr] dpr of 2 doubles provided width', done => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {w: 300, dpr: 2}
  }, {width: 600, height: 450}, done)
})

test('[dpr] dpr of 0.75 downscales from provided width', done => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {w: 300, dpr: 0.75}
  }, {width: 225, height: 169}, done)
})

test('[dpr] downscaled image can still be cropped correctly', done => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {h: 225, dpr: 0.75, fit: 'crop', crop: 'left,bottom'}
  }, {width: 225, height: 169}, done)
})

test('[dpr] downscaled image can still be cropped with focal point correctly', done => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {
      h: 250,
      dpr: 0.75,
      fit: 'crop',
      crop: 'focalpoint',
      'fp-x': 0.251,
      'fp-y': 0.77
    }
  }, {width: 250, height: 188}, done)
})
