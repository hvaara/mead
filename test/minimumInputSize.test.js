const test = require('tape')
const minimumInputSize = require('../src/transform/minimumInputSize')

const tests = [
  // === Fit: crop ===
  // Resize: Square
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

  // Resize: Landscape
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

  // Resize: Portrait
  {
    name: 'fit: crop, resize: portrait, landscape input',
    meta: {width: 1024, height: 341},
    params: {height: 200, width: 160, fit: 'crop'},
    expected: {width: 601, height: 200}
  },
  {
    name: 'fit: crop, resize: portrait, portrait input',
    meta: {width: 341, height: 1024},
    params: {height: 200, width: 160, fit: 'crop'},
    expected: {width: 160, height: 480}
  },
  {
    name: 'fit: crop, resize: portrait, square input',
    meta: {width: 500, height: 500},
    params: {height: 200, width: 160, fit: 'crop'},
    expected: {width: 200, height: 200}
  },

  // === Fit: clip ===
  // Resize: Square
  {
    name: 'fit: clip, resize: square, landscape input',
    meta: {width: 1024, height: 341},
    params: {height: 160, width: 160, fit: 'clip'},
    expected: {width: 160, height: 53}
  },
  {
    name: 'fit: clip, resize: square, portrait input',
    meta: {width: 341, height: 1024},
    params: {height: 160, width: 160, fit: 'clip'},
    expected: {width: 53, height: 160}
  },
  {
    name: 'fit: clip, resize: square, square input',
    meta: {width: 500, height: 500},
    params: {height: 160, width: 160, fit: 'clip'},
    expected: {width: 160, height: 160}
  },

  // Resize: Landscape
  {
    name: 'fit: clip, resize: landscape, landscape input',
    meta: {width: 1024, height: 341},
    params: {height: 160, width: 200, fit: 'clip'},
    expected: {width: 200, height: 67}
  },
  {
    name: 'fit: clip, resize: landscape, portrait input',
    meta: {width: 341, height: 1024},
    params: {height: 160, width: 200, fit: 'clip'},
    expected: {width: 53, height: 160}
  },
  {
    name: 'fit: clip, resize: landscape, square input',
    meta: {width: 500, height: 500},
    params: {height: 160, width: 200, fit: 'clip'},
    expected: {width: 160, height: 160}
  },

  // Resize: Portrait
  {
    name: 'fit: clip, resize: portrait, landscape input',
    meta: {width: 1024, height: 341},
    params: {height: 200, width: 160, fit: 'clip'},
    expected: {width: 160, height: 53}
  },
  {
    name: 'fit: clip, resize: portrait, portrait input',
    meta: {width: 341, height: 1024},
    params: {height: 200, width: 160, fit: 'clip'},
    expected: {width: 67, height: 200}
  },
  {
    name: 'fit: clip, resize: portrait, square input',
    meta: {width: 500, height: 500},
    params: {height: 200, width: 160, fit: 'clip'},
    expected: {width: 160, height: 160}
  },
]

// @todo add more tests for different fits
tests.forEach(({name, meta, params, expected}, i) => {
  test(`[minimumInputSize] can determine correct min size (${name})`, t => {
    const result = minimumInputSize(params, meta)
    t.equal(result.width, expected.width, 'correct width')
    t.equal(result.height, expected.height, 'correct height')
    t.end()
  })
})
