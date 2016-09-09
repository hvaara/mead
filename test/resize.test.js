const test = require('tape')
const {appify, assertSize} = require('./helpers')

const mead = appify()

/******************
 * CLIP MODE      *
 ******************/
test('[resize] maintains aspect ratio by default', t => {
  assertSize({mead, query: {w: 256}, fixture: 'mead.png'}, {width: 256, height: 256}, t)
})

test('[resize] maintains aspect ratio in clip mode', t => {
  assertSize({mead, query: {w: 200, h: 500, fit: 'clip'}}, {width: 200, height: 133}, t)
})

test('[resize] upscales but maintains aspect ratio in clip mode', t => {
  assertSize({mead, query: {w: 600, h: 531, fit: 'clip'}}, {width: 600, height: 400}, t)
})

/******************
 * CROP MODE      *
 ******************/
test('[resize] crops to match dimensions in crop mode', t => {
  assertSize({mead, query: {w: 300, h: 100, fit: 'crop'}}, {width: 300, height: 100}, t)
})

test('[resize] crops to match dimensions in crop mode (square)', t => {
  assertSize({mead, query: {w: 200, h: 200, fit: 'crop'}}, {width: 200, height: 200}, t)
})

/******************
 * FILL MODE      *
 ******************/
test('[resize] fills to match dimensions in fill mode (target larger than original)', t => {
  assertSize({mead, query: {w: 400, h: 420, bg: 'ccc', fit: 'fill'}}, {width: 400, height: 420}, t)
})

test('[resize] fills to match dimensions in fill mode (target smaller than original)', t => {
  assertSize({mead, query: {w: 180, h: 150, bg: 'ccc', fit: 'fill'}}, {width: 180, height: 150}, t)
})

/******************
 * FILLMAX MODE   *
 ******************/
test('[resize] fills to match dimensions in fillmax mode (target larger than original)', t => {
  assertSize({mead, query: {w: 400, h: 420, bg: 'ccc', fit: 'fillmax'}}, {width: 400, height: 420}, t)
})

test('[resize] fills to match dimensions in fillmax mode (target smaller than original)', t => {
  assertSize({mead, query: {w: 180, h: 150, bg: 'ccc', fit: 'fillmax'}}, {width: 180, height: 150}, t)
})

/******************
 * MAX MODE       *
 ******************/
test('[resize] resizes to maximum of original size in max mode', t => {
  assertSize({mead, query: {w: 400, h: 420, fit: 'max'}}, {width: 300, height: 200}, t)
})

test('[resize] resizes to less than original size in max mode (maintains aspect)', t => {
  assertSize({mead, query: {w: 180, h: 150, fit: 'max'}}, {width: 180, height: 120}, t)
})

/******************
 * MIN MODE       *
 ******************/
/*
test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#1)', t => {
  assertSize({mead, query: {w: 500, h: 2000, fit: 'min'}}, {width: 50, height: 200}, t)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#2)', t => {
  assertSize({mead, query: {w: 300, h: 100, fit: 'min'}}, {width: 300, height: 100}, t)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#3)', t => {
  assertSize({mead, query: {w: 150, h: 100, fit: 'min'}}, {width: 150, height: 100}, t)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#4)', t => {
  assertSize({mead, query: {w: 300, h: 205, fit: 'min'}}, {width: 293, height: 200}, t)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#5)', t => {
  assertSize({mead, query: {w: 400, h: 205, fit: 'min'}}, {width: 300, height: 154}, t)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#6)', t => {
  assertSize({mead, query: {w: 500, h: 200, fit: 'min'}}, {width: 300, height: 120}, t)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#7)', t => {
  assertSize({mead, query: {w: 200, h: 250, fit: 'min'}}, {width: 160, height: 200}, t)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#8)', t => {
  assertSize({mead, query: {w: 200, h: 180, fit: 'min'}}, {width: 200, height: 180}, t)
})
*/
/******************
 * SCALE MODE   *
 ******************/
test('[resize] always scales to given size in scale mode, ignores aspect ratio (#1)', t => {
  assertSize({mead, query: {w: 400, h: 420, fit: 'scale'}}, {width: 400, height: 420}, t)
})

test('[resize] always scales to given size in scale mode, ignores aspect ratio (#2)', t => {
  assertSize({mead, query: {w: 177, h: 981, fit: 'scale'}}, {width: 177, height: 981}, t)
})
