const test = require('tape')
const fromQueryString = require('../src/parameters/fromQueryString')

test('[transforms] translates `w` param into numeric `width`', t => {
  const {width} = fromQueryString({w: '1024'})
  t.equal(width, 1024)
  t.end()
})

test('[transforms] does not throw on unknown params', t => {
  fromQueryString({w: '1024', foo: 'bar'})
  t.end()
})

test('[transforms] translates `h` param into numeric `height`', t => {
  const {height} = fromQueryString({h: '768'})
  t.equal(height, 768)
  t.end()
})

test('[transforms] translates `q` param into numeric `quality`', t => {
  const {quality} = fromQueryString({q: '90'})
  t.equal(quality, 90)
  t.end()
})

test('[transforms] translates `or` param into numeric `orientation`', t => {
  const {orientation} = fromQueryString({or: '90'})
  t.equal(orientation, 90)
  t.end()
})

test('[transforms] throws if `or` param is not 0, 90, 180 or 270', t => {
  t.throws(() => fromQueryString({or: '15'}), /must be one of/)
  t.throws(() => fromQueryString({or: '89'}), /must be one of/)
  t.end()
})

test('[transforms] translates `fm` param into object `output`', t => {
  const {output} = fromQueryString({fm: 'pjpg'})
  t.deepEqual(output, {format: 'jpeg', mime: 'image/jpeg', progressive: true})
  t.end()
})

test('[transforms] translates `fm` param into object `output` (alt)', t => {
  const {output} = fromQueryString({fm: 'png'})
  t.deepEqual(output, {format: 'png', mime: 'image/png', progressive: false})
  t.end()
})

test('[transforms] translates `dl` param into `download`', t => {
  const {download} = fromQueryString({dl: 'mahfile.png'})
  t.equal(download, 'mahfile.png')
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor`', t => {
  const {backgroundColor} = fromQueryString({bg: 'ccddee'})
  t.equal(backgroundColor, '#ccddee')
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor` (alpha included)', t => {
  const {backgroundColor} = fromQueryString({bg: 'aaccddee'})
  t.deepEqual(backgroundColor, {a: 2 / 3, b: 238, g: 221, r: 204})
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor` (alpha included - alt)', t => {
  const {backgroundColor} = fromQueryString({bg: 'acde'})
  t.deepEqual(backgroundColor, {a: 2 / 3, b: 238, g: 221, r: 204})
  t.end()
})

test('[transforms] throws if `bg` param is not in hex format', t => {
  t.throws(() => fromQueryString({bg: '255,128,131'}), /hexadecimal/)
  t.end()
})

test('[transforms] throws if `bg` param is not in known hex format', t => {
  t.throws(() => fromQueryString({bg: 'cdebc'}), /hexadecimal/i)
  t.throws(() => fromQueryString({bg: 'cdebc'}), /allowed formats/i)
  t.end()
})

test('[transforms] throws if passing non-integers to integer params', t => {
  t.throws(() => fromQueryString({w: 'foo'}), /valid (number|integer)/)
  t.throws(() => fromQueryString({h: 'foo'}), /valid (number|integer)/)
  t.throws(() => fromQueryString({q: 'foo'}), /valid (number|integer)/)
  t.throws(() => fromQueryString({or: 'foo'}), /valid (number|integer)/)
  t.end()
})

test('[transforms] throws if passing floats to integer params', t => {
  t.throws(() => fromQueryString({w: '18.541'}), /valid integer/)
  t.throws(() => fromQueryString({h: '155.1'}), /valid integer/)
  t.throws(() => fromQueryString({q: '87.4'}), /valid integer/)
  t.throws(() => fromQueryString({or: '56.4'}), /valid integer/)
  t.end()
})

test('[transforms] throws if passing negative numbers to pixel-params', t => {
  t.throws(() => fromQueryString({w: '-130'}), /positive number/)
  t.throws(() => fromQueryString({h: '-1'}), /positive number/)
  t.end()
})

test('[transforms] throws if quality is out of range', t => {
  t.throws(() => fromQueryString({q: '800'}), /be between/)
  t.end()
})


test('[transforms] throws if source rectangle does not have 4 integers', t => {
  t.throws(() => fromQueryString({rect: '800'}), /x,y,w,h/)
  t.end()
})

test('[transforms] throws if crop is not positional', t => {
  t.throws(() => fromQueryString({crop: 'foo'}), /one of/)
  t.end()
})
