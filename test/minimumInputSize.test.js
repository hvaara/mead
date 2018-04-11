const minimumInputSize = require('../src/transform/minimumInputSize')

jest.setTimeout(15000)

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
  {
    name: 'rect + width',
    meta: {width: 1200, height: 2400},
    params: {sourceRectangle: [200, 200, 600, 600], width: 300},
    expected: {width: 600, height: 1200}
  },
  {
    name: 'rect + width, upscaling',
    meta: {width: 120, height: 240},
    params: {sourceRectangle: [20, 20, 12, 12], width: 300},
    expected: {width: 120, height: 240}
  },
  {
    name: 'rect + width, wide',
    meta: {width: 1200, height: 2400},
    params: {sourceRectangle: [20, 20, 400, 200], width: 300},
    expected: {width: 900, height: 1800}
  },
  {
    name: 'rect + width, tall',
    meta: {width: 1200, height: 2400},
    params: {sourceRectangle: [20, 20, 300, 400], width: 300},
    expected: {width: 1200, height: 2400}
  },
  {
    name: 'fit: crop, resize: square, landscape input',
    meta: {width: 1024, height: 341},
    params: {sourceRectangle: [20, 20, 320, 320], height: 160, width: 160, fit: 'crop'},
    expected: {width: 512, height: 171}
  },

]

// @todo add more tests for different fits
tests.forEach(({name, meta, params, expected}, i) => {
  test(`[minimumInputSize] can determine correct min size (${name})`, () => {
    const result = minimumInputSize(params, meta)
    expect(result.width).toBe(expected.width)
    expect(result.height).toBe(expected.height)
  })
})
