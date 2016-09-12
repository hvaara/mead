const test = require('tape')
const constrainSize = require('../src/transform/constrainSize')

test('[constrain] same aspect, smaller than limit, untouched', t => {
  t.deepEqual(constrainSize(
    1000,                       // Max size
    {width: 1024, height: 768}, // Original
    {width: 800, height: 600}   // Wanted
  ), {width: 800, height: 600})
  t.end()
})

test('[constrain] same aspect, width larger, height smaller, downscales', t => {
  t.deepEqual(constrainSize(
    750,                        // Max size
    {width: 1024, height: 768}, // Original
    {width: 800, height: 600}   // Wanted
  ), {width: 750, height: 563})
  t.end()
})

test('[constrain] same aspect, height larger, width smaller, downscales', t => {
  t.deepEqual(constrainSize(
    500,                        // Max size
    {width: 900, height: 1600}, // Original
    {width: 338, height: 600}   // Wanted
  ), {width: 282, height: 500})
  t.end()
})

test('[constrain] same aspect, both larger, downscales', t => {
  t.deepEqual(constrainSize(
    320,                        // Max size
    {width: 1024, height: 768}, // Original
    {width: 800, height: 600}   // Wanted
  ), {width: 320, height: 240})
  t.end()
})
