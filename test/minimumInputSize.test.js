const test = require('tape')
const minimumInputSize = require('../src/transform/minimumInputSize')

const tests = [
  // Fit: crop
  {
    name: 'fit: crop, resize: square, landscape input',
    meta: {width: 1024, height: 341},
    params: {height: 160, width: 160, fit: 'crop'},
    expected: {width: 480, height: 160}
  },
  {
    name: 'fit: crop, resize: square, portrait input',
    meta: {width: 341, height: 1024},
    params: {height: 160, width: 160, fit: 'crop'},
    expected: {width: 160, height: 480}
  },
  {
    name: 'fit: crop, resize: square, square input',
    meta: {width: 500, height: 500},
    params: {height: 160, width: 160, fit: 'crop'},
    expected: {width: 160, height: 160}
  },

  {
    name: 'fit: crop, resize: landscape, landscape input',
    meta: {width: 1024, height: 341},
    params: {height: 160, width: 200, fit: 'crop'},
    expected: {width: 480, height: 160}
  },
  {
    name: 'fit: crop, resize: landscape, portrait input',
    meta: {width: 341, height: 1024},
    params: {height: 160, width: 200, fit: 'crop'},
    expected: {width: 200, height: 601}
  },
  {
    name: 'fit: crop, resize: landscape, square input',
    meta: {width: 500, height: 500},
    params: {height: 160, width: 200, fit: 'crop'},
    expected: {width: 200, height: 200}
  },
]

tests.forEach(({name, meta, params, expected}, i) => {
  test(`[minimumInputSize] can determine correct min size (${name})`, t => {
    const result = minimumInputSize(params, meta)
    t.equal(result.width, expected.width, 'correct width')
    t.equal(result.height, expected.height, 'correct height')
    t.end()
  })
})
