const {appify, assertSize, readImage} = require('./helpers')

const mead = appify()

jest.setTimeout(15000)

// eslint-disable-next-line no-console
test.skip = testName => console.log(`# Skipped: ${testName}`)

/********************
 * CLIP MODE        *
 ********************/
test('[resize] maintains aspect ratio by default', done => {
  assertSize({mead, query: {w: 256}, fixture: 'mead.png'}, {width: 256, height: 256}, done)
})

test('[resize] maintains aspect ratio in clip mode', done => {
  assertSize({mead, query: {w: 200, h: 500, fit: 'clip'}}, {width: 200, height: 133}, done)
})

test('[resize] upscales but maintains aspect ratio in clip mode', done => {
  assertSize({mead, query: {w: 600, h: 531, fit: 'clip'}}, {width: 600, height: 400}, done)
})

test('[resize] ignores resize in clip mode when no w/h given', done => {
  assertSize({mead, query: {fit: 'clip'}}, {width: 300, height: 200}, done)
})

/**********************
 * CLIP BY DEFAULT    *
 **********************/
test('[resize] uses clip fit by default', end => {
  let completed = 0
  const done = err => ++completed === 4 && end.call(end, err)

  assertSize({mead, query: {w: 256}, fixture: 'mead.png'}, {width: 256, height: 256}, done)
  assertSize({mead, query: {w: 200, h: 500}}, {width: 200, height: 133}, done)
  assertSize({mead, query: {w: 600, h: 531}}, {width: 600, height: 400}, done)
  assertSize({mead, query: {}}, {width: 300, height: 200}, done)
})

/********************
 * CROP MODE        *
 ********************/
test('[resize] crops to match dimensions in crop mode', done => {
  assertSize({mead, query: {w: 300, h: 100, fit: 'crop'}}, {width: 300, height: 100}, done)
})

test('[resize] crops to match dimensions in crop mode (square)', done => {
  assertSize({mead, query: {w: 200, h: 200, fit: 'crop'}}, {width: 200, height: 200}, done)
})

test('[resize] crops to focal point', done => {
  readImage('landscape.png?fp-x=0.10&fp-y=.62&w=256&h=256&fit=crop&crop=focalpoint').then(img => {
    expect(img.colorAt(5, 215)).toBe('f59b07')
    done()
  })
})

test('[resize] crops to focal point (alt)', done => {
  readImage('landscape.png?fp-x=.698&fp-y=0.367&w=256&h=256&fit=crop&crop=focalpoint').then(img => {
    expect(img.colorAt(128, 96)).toBe('8e44ae')
    done()
  })
})

test('[resize] crops to focal point (square)', done => {
  readImage('mead.png?fp-x=0.75&fp-y=0.75&w=256&h=256&fit=crop&crop=focalpoint').then(img => {
    expect(img.colorAt(192, 192)).toBe('ff9300')
    done()
  })
})

test('[resize] ignores resize in crop mode when no w/h given', done => {
  assertSize({mead, query: {fit: 'crop'}}, {width: 300, height: 200}, done)
})

/********************
 * FILL MODE        *
 ********************/
test('[resize] fills to match dimensions in fill mode (target larger than original)', done => {
  assertSize({mead, query: {w: 400, h: 420, bg: 'ccc', fit: 'fill'}}, {width: 400, height: 420}, done)
})

test('[resize] fills to match dimensions in fill mode (target smaller than original)', done => {
  assertSize({mead, query: {w: 180, h: 150, bg: 'ccc', fit: 'fill'}}, {width: 180, height: 150}, done)
})

test('[resize] ignores resize in fill mode when no w/h given', done => {
  assertSize({mead, query: {fit: 'fill'}}, {width: 300, height: 200}, done)
})

/********************
 * FILLMAX MODE     *
 ********************/
test('[resize] fills to match dimensions in fillmax mode (target larger than original)', done => {
  assertSize({mead, query: {w: 400, h: 420, bg: 'ccc', fit: 'fillmax'}}, {width: 400, height: 420}, done)
})

test('[resize] fills to match dimensions in fillmax mode (target smaller than original)', done => {
  assertSize({mead, query: {w: 180, h: 150, bg: 'ccc', fit: 'fillmax'}}, {width: 180, height: 150}, done)
})

test('[resize] fills the remainder of the size with background color', done => {
  readImage('mead.png?w=256&h=512&fit=fillmax&bg=bf1942').then(img => {
    expect(img.width).toBe(256)
    expect(img.height).toBe(512)
    expect(img.colorAt(0, 0)).toBe('bf1942')
    expect(img.colorAt(0, 511)).toBe('bf1942')
    done()
  })
})

test('[resize] ignores resize in fillmax mode when no w/h given', done => {
  assertSize({mead, query: {fit: 'fillmax'}}, {width: 300, height: 200}, done)
})

/********************
 * MAX MODE         *
 ********************/
test('[resize] resizes to maximum of original size in max mode', done => {
  assertSize({mead, query: {w: 400, h: 420, fit: 'max'}}, {width: 300, height: 200}, done)
})

test('[resize] resizes to less than original size in max mode (maintains aspect)', done => {
  assertSize({mead, query: {w: 180, h: 150, fit: 'max'}}, {width: 180, height: 120}, done)
})

test('[resize] ignores resize in max mode when no w/h given', done => {
  assertSize({mead, query: {fit: 'max'}}, {width: 300, height: 200}, done)
})

/********************
 * MIN MODE         *
 ********************/
test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#1)', done => {
  assertSize({mead, query: {w: 500, h: 2000, fit: 'min'}}, {width: 50, height: 200}, done)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#2)', done => {
  assertSize({mead, query: {w: 300, h: 100, fit: 'min'}}, {width: 300, height: 100}, done)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#3)', done => {
  assertSize({mead, query: {w: 150, h: 100, fit: 'min'}}, {width: 150, height: 100}, done)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#4)', done => {
  assertSize({mead, query: {w: 300, h: 205, fit: 'min'}}, {width: 293, height: 200}, done)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#5)', done => {
  assertSize({mead, query: {w: 400, h: 205, fit: 'min'}}, {width: 300, height: 154}, done)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#6)', done => {
  assertSize({mead, query: {w: 500, h: 200, fit: 'min'}}, {width: 300, height: 120}, done)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#7)', done => {
  assertSize({mead, query: {w: 200, h: 250, fit: 'min'}}, {width: 160, height: 200}, done)
})

test('[resize] resizes/crops to given aspect ratio, not exceeding original size (#8)', done => {
  assertSize({mead, query: {w: 200, h: 180, fit: 'min'}}, {width: 200, height: 180}, done)
})

test('[resize] ignores resize in min mode when no w/h given', done => {
  assertSize({mead, query: {fit: 'min'}}, {width: 300, height: 200}, done)
})

/********************
 * SCALE MODE       *
 ********************/
test('[resize] always scales to given size in scale mode, ignores aspect ratio (#1)', done => {
  assertSize({mead, query: {w: 400, h: 420, fit: 'scale'}}, {width: 400, height: 420}, done)
})

test('[resize] always scales to given size in scale mode, ignores aspect ratio (#2)', done => {
  assertSize({mead, query: {w: 177, h: 981, fit: 'scale'}}, {width: 177, height: 981}, done)
})

test('[resize] ignores resize in scale mode when no w/h given', done => {
  assertSize({mead, query: {fit: 'scale'}}, {width: 300, height: 200}, done)
})

/********************
 * FRACTION SIZE    *
 ********************/
test('[resize] can use fractions of original width to resize', done => {
  assertSize({mead, query: {w: 0.5}, fixture: 'mead.png'}, {width: 256, height: 256}, done)
})

test('[resize] can use fractions of original height to resize', done => {
  assertSize({mead, query: {h: 0.25}, fixture: 'mead.png'}, {width: 128, height: 128}, done)
})

/********************
 * OVERLAY + RESIZE *
 ********************/
test('[resize] can overlay when resizing', done => {
  assertSize(
    {mead, query: {w: 700, border: '10,ccbf1942'}, fixture: 'landscape.png'},
    {width: 700}, done
  )
})

/**********************
 * MAX WIDTH/HEIGHT   *
 **********************/
test('[resize] can give a max width when fit is "crop"', done => {
  assertSize(
    {mead, query: {'max-w': 512, h: 500, fit: 'crop'}, fixture: 'landscape.png'},
    {width: 512, height: 500}, done
  )
})

test('[resize] can give a max height when fit is "crop"', done => {
  assertSize(
    {mead, query: {'max-h': 400, w: 800, fit: 'crop'}, fixture: 'landscape.png'},
    {width: 800, height: 400}, done
  )
})

test('[resize] max width does nothing if fit is not "crop"', done => {
  assertSize(
    {mead, query: {'max-w': 512, h: 500}, fixture: 'landscape.png'},
    {width: 988, height: 500}, done
  )
})

test('[resize] max height does nothing if fit is not "crop"', done => {
  assertSize(
    {mead, query: {'max-h': 400, w: 800}, fixture: 'landscape.png'},
    {width: 800, height: 405}, done
  )
})

/**********************
 * SHRINK TO ZERO     *
 **********************/
test.skip('[resize] will not shrink images to below 1px in height', done => {
  assertSize(
    {mead, query: {w: 100}, fixture: '2000x4.png'},
    {width: 100, height: 1}, done
  )
})

test.skip('[resize] will not shrink images to below 1px in width', done => {
  assertSize(
    {mead, query: {h: 100}, fixture: '4x2000.png'},
    {height: 100, width: 1}, done
  )
})

/********************
 * RUNTHROUGH       *
 ********************/
const tests = [
  ['001', 'portrait.png?h=1250&fit=crop', {w: 1008, h: 1250, calc: {w: 1}}],
  ['002', 'portrait.png?h=1250&fit=fill', {w: 1007, h: 1250, calc: {w: 1}}],
  ['003', 'landscape.png?w=2200&fit=max', {w: 1920, h: 972, calc: {h: 1}}],
  ['004', 'landscape.png?w=2200&fit=clip', {w: 2200, h: 1114, calc: {h: 1}}],
  ['005', 'portrait.png?h=1250&fit=scale', {w: 1008, h: 1250, calc: {w: 1}}],
  ['006', 'landscape.png?w=2200&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 2200, h: 1114, calc: {h: 1}}],
  ['007', 'landscape.png?w=2200&fit=fillmax', {w: 1920, h: 972, calc: {h: 1}}],
  ['008', 'landscape.png?w=2200&fit=crop', {w: 2200, h: 1114, calc: {h: 1}}],
  ['009', 'portrait.png?h=1250&fit=clip', {w: 1008, h: 1250, calc: {w: 1}}],
  ['010', 'landscape.png?w=2200&fit=fill', {w: 2200, h: 1114, calc: {h: 1}}],
  ['011', 'landscape.png?w=2200&fit=fillmax&bg=bf1942', {w: 2200, h: 1114, calc: {h: 1}}],
  ['012', 'portrait.png?h=1250&fit=min', {w: 714, h: 885, calc: {w: 1}}],
  ['013', 'landscape.png?w=2200&fit=fill&bg=bf1942', {w: 2200, h: 1114, calc: {h: 1}}],
  ['014', 'landscape.png?w=2200&fit=scale', {w: 2200, h: 1114, calc: {h: 1}}],
  ['015', 'portrait.png?h=1250&fit=fillmax&bg=bf1942', {w: 1008, h: 1250, calc: {w: 1}}],
  ['016', 'landscape.png?w=2200&fit=min', {w: 1920, h: 972, calc: {h: 1}}],
  ['017', 'portrait.png?h=1250&fit=max', {w: 714, h: 885, calc: {w: 1}}],
  ['018', 'small-landscape.png?w=640&fit=min', {w: 367, h: 153, calc: {h: 1}}],
  ['019', 'portrait.png?h=1250&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 1008, h: 1250, calc: {w: 1}}],
  ['020', 'small-landscape.png?w=640&fit=max', {w: 367, h: 153, calc: {h: 1}}],
  ['021', 'mead.png?w=1000&fit=max', {w: 512, h: 512, calc: {h: 1}}],
  ['022', 'mead.png?w=1000&fit=min', {w: 512, h: 512, calc: {h: 1}}],
  ['023', 'portrait.png?h=1250&fit=fillmax', {w: 714, h: 885, calc: {w: 1}}],
  ['024', 'small-landscape.png?w=640&fit=scale', {w: 640, h: 267, calc: {h: 1}}],
  ['025', 'small-landscape.png?w=640&fit=crop', {w: 640, h: 267, calc: {h: 1}}],
  ['026', 'small-landscape.png?w=640&fit=fill', {w: 640, h: 267, calc: {h: 1}}],
  ['027', 'small-landscape.png?w=640&fit=fill&bg=bf1942', {w: 640, h: 267, calc: {h: 1}}],
  ['028', 'small-landscape.png?w=640&fit=fillmax&bg=bf1942', {w: 640, h: 267, calc: {h: 1}}],
  ['029', 'small-portrait.png?w=320&fit=max', {w: 147, h: 230, calc: {h: 1}}],
  ['030', 'small-landscape.png?w=640&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 640, h: 267, calc: {h: 1}}],
  ['031', 'small-portrait.png?w=320&fit=min', {w: 147, h: 230, calc: {h: 1}}],
  ['032', 'small-portrait.png?w=320&fit=fillmax', {w: 147, h: 230, calc: {h: 1}}],
  ['033', 'small-landscape.png?w=640&fit=clip', {w: 640, h: 267, calc: {h: 1}}],
  ['034', 'small-portrait.png?w=320&h=140&fit=scale', {w: 320, h: 140, calc: {}}],
  ['035', 'small-portrait.png?w=320&h=140&fit=max', {w: 89, h: 140, calc: {}}],
  ['036', 'small-portrait.png?w=320&fit=fillmax&bg=bf1942', {w: 320, h: 501, calc: {h: 1}}],
  ['037', 'mead.png?w=1000&fit=fillmax&bg=bf1942', {w: 1000, h: 1000, calc: {h: 1}}],
  ['038', 'small-portrait.png?w=320&h=140&fit=min', {w: 147, h: 64, calc: {}}],
  ['039', 'mead.png?w=1000&fit=clip', {w: 1000, h: 1000, calc: {h: 1}}],
  ['040', 'mead.png?w=1000&fit=scale', {w: 1000, h: 1000, calc: {h: 1}}],
  ['041', 'small-portrait.png?w=320&h=140&fit=clip', {w: 89, h: 140, calc: {}}],
  ['042', 'mead.png?w=1000&fit=crop', {w: 1000, h: 1000, calc: {h: 1}}],
  ['043', 'small-portrait.png?w=320&h=140&fit=fill', {w: 89, h: 140, calc: {}}],
  ['044', 'small-portrait.png?w=320&fit=clip', {w: 320, h: 501, calc: {h: 1}}],
  ['045', 'small-portrait.png?w=320&fit=fill', {w: 320, h: 501, calc: {h: 1}}],
  ['046', 'small-portrait.png?w=320&fit=crop', {w: 320, h: 501, calc: {h: 1}}],
  ['047', 'mead.png?w=1000&fit=fill', {w: 1000, h: 1000, calc: {h: 1}}],
  ['048', 'small-portrait.png?w=320&h=140&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 320, h: 140, calc: {}}],
  ['049', 'small-portrait.png?w=320&h=140&fit=crop', {w: 320, h: 140, calc: {}}],
  ['050', 'small-portrait.png?w=320&h=140&fit=fill&bg=bf1942', {w: 320, h: 140, calc: {}}],
  ['051', 'small-portrait.png?w=320&fit=fill&bg=bf1942', {w: 320, h: 501, calc: {h: 1}}],
  ['052', 'small-portrait.png?w=320&h=140&fit=fillmax&bg=bf1942', {w: 320, h: 140, calc: {}}],
  ['053', 'small-portrait.png?w=320&fit=scale', {w: 320, h: 501, calc: {h: 1}}],
  ['054', 'small-portrait.png?w=320&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 320, h: 501, calc: {h: 1}}],
  ['055', 'landscape.png?w=800&fit=clip', {w: 800, h: 405, calc: {h: 1}}],
  ['056', 'landscape.png?w=800&fit=crop', {w: 800, h: 405, calc: {h: 1}}],
  ['057', 'landscape.png?w=800&fit=scale', {w: 800, h: 405, calc: {h: 1}}],
  ['058', 'mead.png?w=1000&fit=fill&bg=bf1942', {w: 1000, h: 1000, calc: {h: 1}}],
  ['059', 'small-landscape.png?w=640&fit=fillmax', {w: 367, h: 153, calc: {h: 1}}],
  ['060', 'landscape.png?w=800&fit=min', {w: 800, h: 405, calc: {h: 1}}],
  ['061', 'landscape.png?w=800&fit=fill', {w: 800, h: 405, calc: {h: 1}}],
  ['062', 'portrait.png?h=1250&fit=fill&bg=bf1942', {w: 1008, h: 1250, calc: {w: 1}}],
  ['063', 'mead.png?w=1000&fit=fillmax', {w: 512, h: 512, calc: {h: 1}}],
  ['064', 'portrait.png?h=400&fit=clip', {w: 323, h: 400, calc: {w: 1}}],
  ['065', 'landscape.png?w=800&fit=fillmax&bg=bf1942', {w: 800, h: 405, calc: {h: 1}}],
  ['066', 'portrait.png?h=400&fit=max', {w: 323, h: 400, calc: {w: 1}}],
  ['067', 'mead.png?w=1000&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 1000, h: 1000, calc: {h: 1}}],
  ['068', 'landscape.png?w=800&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 800, h: 405, calc: {h: 1}}],
  ['069', 'portrait.png?h=400&fit=scale', {w: 323, h: 400, calc: {w: 1}}],
  ['070', 'portrait.png?h=400&fit=fill', {w: 323, h: 400, calc: {w: 1}}],
  ['071', 'portrait.png?h=400&fit=fillmax', {w: 323, h: 400, calc: {w: 1}}],
  ['072', 'portrait.png?h=400&fit=min', {w: 323, h: 400, calc: {w: 1}}],
  ['073', 'portrait.png?h=400&fit=crop', {w: 323, h: 400, calc: {w: 1}}],
  ['074', 'portrait.png?h=400&fit=fill&bg=bf1942', {w: 323, h: 400, calc: {w: 1}}],
  ['075', 'landscape.png?w=800&fit=fillmax', {w: 800, h: 405, calc: {h: 1}}],
  ['076', 'small-landscape.png?h=100&fit=scale', {w: 240, h: 100, calc: {w: 1}}],
  ['077', 'portrait.png?h=400&fit=fillmax&bg=bf1942', {w: 323, h: 400, calc: {w: 1}}],
  ['078', 'small-portrait.png?w=320&h=140&fit=fillmax', {w: 89, h: 140, calc: {}}],
  ['079', 'small-landscape.png?h=100&fit=max', {w: 240, h: 100, calc: {w: 1}}],
  ['080', 'small-landscape.png?h=100&fit=min', {w: 240, h: 100, calc: {w: 1}}],
  ['081', 'mead.png?w=256&fit=clip', {w: 256, h: 256, calc: {h: 1}}],
  ['082', 'mead.png?w=256&fit=scale', {w: 256, h: 256, calc: {h: 1}}],
  ['083', 'mead.png?w=256&fit=crop', {w: 256, h: 256, calc: {h: 1}}],
  ['084', 'small-landscape.png?h=100&fit=crop', {w: 240, h: 100, calc: {w: 1}}],
  ['085', 'small-landscape.png?h=100&fit=fillmax', {w: 240, h: 100, calc: {w: 1}}],
  ['086', 'mead.png?w=256&fit=min', {w: 256, h: 256, calc: {h: 1}}],
  ['087', 'small-landscape.png?h=100&fit=fill&bg=bf1942', {w: 240, h: 100, calc: {w: 1}}],
  ['088', 'landscape.png?w=800&fit=max', {w: 800, h: 405, calc: {h: 1}}],
  ['089', 'mead.png?w=256&fit=fill&bg=bf1942', {w: 256, h: 256, calc: {h: 1}}],
  ['090', 'mead.png?w=256&fit=max', {w: 256, h: 256, calc: {h: 1}}],
  ['091', 'mead.png?w=256&fit=fillmax&bg=bf1942', {w: 256, h: 256, calc: {h: 1}}],
  ['092', 'mead.png?w=256&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 256, h: 256, calc: {h: 1}}],
  ['093', 'small-landscape.png?h=100&fit=clip', {w: 240, h: 100, calc: {w: 1}}],
  ['094', 'small-landscape.png?h=100&w=133&fit=clip', {w: 133, h: 55, calc: {}}],
  ['095', 'small-landscape.png?h=100&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 240, h: 100, calc: {w: 1}}],
  ['096', 'mead.png?w=256&fit=fillmax', {w: 256, h: 256, calc: {h: 1}}],
  ['097', 'small-landscape.png?h=100&fit=fillmax&bg=bf1942', {w: 240, h: 100, calc: {w: 1}}],
  ['098', 'small-landscape.png?h=100&fit=fill', {w: 240, h: 100, calc: {w: 1}}],
  ['099', 'small-landscape.png?h=100&w=133&fit=crop', {w: 133, h: 100, calc: {}}],
  ['100', 'portrait.png?h=400&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 323, h: 400, calc: {w: 1}}],
  ['101', 'small-landscape.png?h=100&w=133&fit=min', {w: 133, h: 100, calc: {}}],
  ['102', 'small-landscape.png?h=100&w=133&fit=scale', {w: 133, h: 100, calc: {}}],
  ['103', 'small-landscape.png?h=100&w=133&fit=fill&bg=bf1942', {w: 133, h: 100, calc: {}}],
  ['104', 'small-landscape.png?h=100&w=133&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 133, h: 100, calc: {}}],
  ['105', 'small-landscape.png?h=100&w=133&fit=fill', {w: 133, h: 55, calc: {}}],
  ['106', 'small-portrait.png?w=100&fit=clip', {w: 100, h: 156, calc: {h: 1}}],
  ['107', 'landscape.png?w=800&fit=fill&bg=bf1942', {w: 800, h: 405, calc: {h: 1}}],
  ['108', 'small-portrait.png?w=100&fit=max', {w: 100, h: 156, calc: {h: 1}}],
  ['109', 'mead.png?w=256&fit=fill', {w: 256, h: 256, calc: {h: 1}}],
  ['110', 'small-portrait.png?w=100&fit=scale', {w: 100, h: 156, calc: {h: 1}}],
  ['111', 'small-portrait.png?w=100&fit=fill', {w: 100, h: 155, calc: {h: 1}}],
  ['112', 'small-portrait.png?w=100&fit=min', {w: 100, h: 156, calc: {h: 1}}],
  ['113', 'small-portrait.png?w=100&fit=fill&bg=bf1942', {w: 100, h: 156, calc: {h: 1}}],
  ['114', 'small-portrait.png?w=100&fit=fillmax&bg=bf1942', {w: 100, h: 156, calc: {h: 1}}],
  ['115', 'small-portrait.png?w=100&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 100, h: 156, calc: {h: 1}}],
  ['116', 'small-portrait.png?w=100&fit=fillmax', {w: 100, h: 155, calc: {h: 1}}],
  ['117', 'small-portrait.png?w=100&fit=crop', {w: 100, h: 156, calc: {h: 1}}],
  ['118', 'mead.png?w=256&h=512&fit=clip', {w: 256, h: 256, calc: {}}],
  ['119', 'small-landscape.png?h=100&w=133&fit=max', {w: 133, h: 55, calc: {}}],
  ['120', 'mead.png?w=256&h=512&fit=min', {w: 256, h: 512, calc: {}}],
  ['121', 'mead.png?w=256&h=512&fit=crop', {w: 256, h: 512, calc: {}}],
  ['122', 'small-landscape.png?h=100&w=133&fit=fillmax', {w: 133, h: 55, calc: {}}],
  ['123', 'mead.png?w=256&h=512&fit=fill', {w: 256, h: 256, calc: {}}],
  ['124', 'mead.png?w=256&h=512&fit=fill&bg=bf1942', {w: 256, h: 512, calc: {}}],
  ['125', 'small-landscape.png?h=100&w=133&fit=fillmax&bg=bf1942', {w: 133, h: 100, calc: {}}],
  ['126', 'mead.png?w=256&h=512&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 256, h: 512, calc: {}}],
  ['127', 'mead.png?w=256&h=512&fit=scale', {w: 256, h: 512, calc: {}}],
  ['128', 'mead.png?w=256&h=512&fit=fillmax', {w: 256, h: 256, calc: {}}],
  ['129', 'mead.png?w=256&h=512&fit=max', {w: 256, h: 256, calc: {}}],
  ['130', 'mead.png?w=256&h=512&fit=fillmax&bg=bf1942', {w: 256, h: 512, calc: {}}],
  ['131', 'mead.png?bg=ccc&w=768&height=768&fit=max', {w: 512, h: 512, calc: {h: 1}}],
  ['132', 'mead.png?bg=ccc&w=768&height=768&fit=scale', {w: 768, h: 768, calc: {h: 1}}],
  ['133', 'mead.png?bg=ccc&w=768&height=768&fit=crop&crop=focalpoint&fp-x=0.251&fp-y=0.77', {w: 768, h: 768, calc: {h: 1}}],
  ['134', 'mead.png?bg=ccc&w=768&height=768&fit=fillmax', {w: 768, h: 768, calc: {h: 1}}],
  ['135', 'mead.png?bg=ccc&w=768&height=768&fit=clip', {w: 768, h: 768, calc: {h: 1}}],
  ['136', 'mead.png?bg=ccc&w=768&height=768&fit=min', {w: 512, h: 512, calc: {h: 1}}],
  ['137', 'mead.png?bg=ccc&w=768&height=768&fit=fillmax&bg=bf1942', {w: 768, h: 768, calc: {h: 1}}],
  ['138', 'mead.png?bg=ccc&w=768&height=768&fit=fill&bg=bf1942', {w: 768, h: 768, calc: {h: 1}}],
  ['139', 'mead.png?bg=ccc&w=768&height=768&fit=fill', {w: 768, h: 768, calc: {h: 1}}],
  ['140', 'mead.png?bg=ccc&w=768&height=768&fit=crop', {w: 768, h: 768, calc: {h: 1}}]
]

tests.forEach(it => {
  const [testNum, operation, expected] = it
  const filename = operation.split('.', 2)[0]
  const fit = (operation.match(/&fit=(.*?)(&|$)/) || [])[1] || 'default'

  test(`[resize] [${testNum}] ${filename} using ${fit}`, done => {
    readImage(`/${operation}`).then(img => {
      if (expected.calc.w) {
        const range = {min: expected.w - 1, max: expected.w + 1}
        expect(img.width >= range.min && img.width <= range.max).toBeTruthy()
      } else {
        expect(img.width).toBe(expected.w)
      }

      if (expected.calc.h) {
        const range = {min: expected.h - 1, max: expected.h + 1}
        expect(img.height >= range.min && img.height <= range.max).toBeTruthy()
      } else {
        expect(img.height).toBe(expected.h)
      }

      done()
    }).catch(done)
  })
})

