const test = require('tape')
const {appify, assertSize} = require('./helpers')

const mead = appify()

test('[dpr] dpr of 1 uses provided width', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {w: 300, dpr: 1}
  }, {width: 300, height: 225}, t)
})

test('[dpr] dpr of 2 doubles provided width', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {w: 300, dpr: 2}
  }, {width: 600, height: 450}, t)
})

test('[dpr] dpr of 0.75 downscales from provided width', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {w: 300, dpr: 0.75}
  }, {width: 225, height: 169}, t)
})

test('[dpr] downscaled image can still be cropped correctly', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {h: 225, dpr: 0.75, fit: 'crop', crop: 'left,bottom'}
  }, {width: 225, height: 169}, t)
})

test('[dpr] downscaled image can still be cropped with focal point correctly', t => {
  assertSize({
    mead,
    fixture: 'trim.jpg',
    query: {
      'h': 250,
      'dpr': 0.75,
      'fit': 'crop',
      'crop': 'focalpoint',
      'fp-x': 0.251,
      'fp-y': 0.77
    }
  }, {width: 250, height: 188}, t)
})
