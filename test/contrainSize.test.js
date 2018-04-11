/* eslint-disable no-multi-spaces */
const constrainSize = require('../src/transform/constrainSize')

jest.setTimeout(15000)

test('[constrain] same aspect, smaller than limit, untouched', () => {
  expect(constrainSize(
    1000,                       // Max size
    {width: 1024, height: 768}, // Original
    {width: 800, height: 600}   // Wanted
  )).toEqual({width: 800, height: 600})
})

test('[constrain] same aspect, width larger, height smaller, downscales', () => {
  expect(constrainSize(
    750,                        // Max size
    {width: 1024, height: 768}, // Original
    {width: 800, height: 600}   // Wanted
  )).toEqual({width: 750, height: 563})
})

test('[constrain] same aspect, height larger, width smaller, downscales', () => {
  expect(constrainSize(
    500,                        // Max size
    {width: 900, height: 1600}, // Original
    {width: 338, height: 600}   // Wanted
  )).toEqual({width: 282, height: 500})
})

test('[constrain] same aspect, both larger, downscales', () => {
  expect(constrainSize(
    320,                        // Max size
    {width: 1024, height: 768}, // Original
    {width: 800, height: 600}   // Wanted
  )).toEqual({width: 320, height: 240})
})
