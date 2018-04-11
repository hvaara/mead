const fromQueryString = require('../src/parameters/fromQueryString')

test('[queryparams] translates `w` param into numeric `width`', () => {
  const {width} = fromQueryString({w: '1024'})
  expect(width).toBe(1024)
})

test('[queryparams] does not throw on unknown params', () => {
  fromQueryString({w: '1024', foo: 'bar'})
})

test('[queryparams] translates `h` param into numeric `height`', () => {
  const {height} = fromQueryString({h: '768'})
  expect(height).toBe(768)
})

test('[queryparams] translates `q` param into numeric `quality`', () => {
  const {quality} = fromQueryString({q: '90'})
  expect(quality).toBe(90)
})

test('[queryparams] translates `or` param into numeric `orientation`', () => {
  const {orientation} = fromQueryString({or: '90'})
  expect(orientation).toBe(90)
})

test('[queryparams] throws if `or` param is not 0, 90, 180 or 270', () => {
  expect(() => fromQueryString({or: '15'})).toThrowError(/must be one of/)
  expect(() => fromQueryString({or: '89'})).toThrowError(/must be one of/)
})

test('[queryparams] translates `fm` param into object `output`', () => {
  const {output} = fromQueryString({fm: 'pjpg'})
  expect(output).toEqual({format: 'jpeg', mime: 'image/jpeg', progressive: true})
})

test('[queryparams] translates `fm` param into object `output` (alt)', () => {
  const {output} = fromQueryString({fm: 'png'})
  expect(output).toEqual({format: 'png', mime: 'image/png', progressive: false})
})

test('[queryparams] translates `dl` param into `download`', () => {
  const {download} = fromQueryString({dl: 'mahfile.png'})
  expect(download).toBe('mahfile.png')
})

test('[queryparams] translates `bg` param into `backgroundColor`', () => {
  const {backgroundColor} = fromQueryString({bg: 'ccddee'})
  expect(backgroundColor).toBe('#ccddee')
})

test('[queryparams] translates `bg` param into `backgroundColor` (alpha included)', () => {
  const {backgroundColor} = fromQueryString({bg: 'aaccddee'})
  expect(backgroundColor).toEqual({
    r: 204,
    g: 221,
    b: 238,
    alpha: 2 / 3
  })
})

test('[queryparams] translates `bg` param into `backgroundColor` (alpha included - alt)', () => {
  const {backgroundColor} = fromQueryString({bg: 'acde'})
  expect(backgroundColor).toEqual({
    r: 204,
    g: 221,
    b: 238,
    alpha: 2 / 3
  })
})

test('[queryparams] throws if `bg` param is not in hex format', () => {
  expect(() => fromQueryString({bg: '255,128,131'})).toThrowError(/hexadecimal/)
})

test('[queryparams] throws if `bg` param is not in known hex format', () => {
  expect(() => fromQueryString({bg: 'cdebc'})).toThrowError(/hexadecimal/i)
  expect(() => fromQueryString({bg: 'cdebc'})).toThrowError(/allowed formats/i)
})

test('[queryparams] throws if passing non-integers to integer params', () => {
  expect(() => fromQueryString({w: 'foo'})).toThrowError(/valid (number|integer)/)
  expect(() => fromQueryString({h: 'foo'})).toThrowError(/valid (number|integer)/)
  expect(() => fromQueryString({q: 'foo'})).toThrowError(/valid (number|integer)/)
  expect(() => fromQueryString({or: 'foo'})).toThrowError(/valid (number|integer)/)
})

test('[queryparams] throws if passing floats to integer params', () => {
  expect(() => fromQueryString({w: '18.541'})).toThrowError(/valid integer/)
  expect(() => fromQueryString({h: '155.1'})).toThrowError(/valid integer/)
  expect(() => fromQueryString({q: '87.4'})).toThrowError(/valid integer/)
  expect(() => fromQueryString({or: '56.4'})).toThrowError(/valid integer/)
})

test('[queryparams] throws if passing negative numbers to pixel-params', () => {
  expect(() => fromQueryString({w: '-130'})).toThrowError(/positive number/)
  expect(() => fromQueryString({h: '-1'})).toThrowError(/positive number/)
})

test('[queryparams] throws if quality is out of range', () => {
  expect(() => fromQueryString({q: '800'})).toThrowError(/be between/)
})

test('[queryparams] throws if source rectangle does not have 4 integers', () => {
  expect(() => fromQueryString({rect: '800'})).toThrowError(/x,y,w,h/)
})

test('[queryparams] throws if crop is not positional', () => {
  expect(() => fromQueryString({crop: 'foo'})).toThrowError(/one of/)
})
