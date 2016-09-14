const test = require('tape')
const mapQueryParameters = require('../src/transform/mapQueryParameters')

test('[transforms] translates `w` param into numeric `width`', t => {
  const {width} = mapQueryParameters({w: '1024'})
  t.equal(width, 1024)
  t.end()
})

test('[transforms] does not throw on unknown params', t => {
  mapQueryParameters({w: '1024', foo: 'bar'})
  t.end()
})

test('[transforms] translates `h` param into numeric `height`', t => {
  const {height} = mapQueryParameters({h: '768'})
  t.equal(height, 768)
  t.end()
})

test('[transforms] translates `q` param into numeric `quality`', t => {
  const {quality} = mapQueryParameters({q: '90'})
  t.equal(quality, 90)
  t.end()
})

test('[transforms] translates `or` param into numeric `orientation`', t => {
  const {orientation} = mapQueryParameters({or: '90'})
  t.equal(orientation, 90)
  t.end()
})

test('[transforms] throws if `or` param is not 0, 90, 180 or 270', t => {
  t.throws(() => mapQueryParameters({or: '15'}), /must be one of/)
  t.throws(() => mapQueryParameters({or: '89'}), /must be one of/)
  t.end()
})

test('[transforms] translates `fm` param into object `output`', t => {
  const {output} = mapQueryParameters({fm: 'pjpg'})
  t.deepEqual(output, {format: 'jpeg', mime: 'image/jpeg', progressive: true})
  t.end()
})

test('[transforms] translates `fm` param into object `output` (alt)', t => {
  const {output} = mapQueryParameters({fm: 'png'})
  t.deepEqual(output, {format: 'png', mime: 'image/png', progressive: false})
  t.end()
})

test('[transforms] translates `dl` param into `download`', t => {
  const {download} = mapQueryParameters({dl: 'mahfile.png'})
  t.equal(download, 'mahfile.png')
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor`', t => {
  const {backgroundColor} = mapQueryParameters({bg: 'ccddee'})
  t.equal(backgroundColor, '#ccddee')
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor` (alpha included)', t => {
  const {backgroundColor} = mapQueryParameters({bg: 'aaccddee'})
  t.deepEqual(backgroundColor, {a: 2 / 3, b: 238, g: 221, r: 204})
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor` (alpha included - alt)', t => {
  const {backgroundColor} = mapQueryParameters({bg: 'acde'})
  t.deepEqual(backgroundColor, {a: 2 / 3, b: 238, g: 221, r: 204})
  t.end()
})

test('[transforms] throws if `bg` param is not in hex format', t => {
  t.throws(() => mapQueryParameters({bg: '255,128,131'}), /hexadecimal/)
  t.end()
})

test('[transforms] throws if `bg` param is not in known hex format', t => {
  t.throws(() => mapQueryParameters({bg: 'cdebc'}), /hexadecimal/i)
  t.throws(() => mapQueryParameters({bg: 'cdebc'}), /allowed formats/i)
  t.end()
})

test('[transforms] throws if passing non-integers to integer params', t => {
  t.throws(() => mapQueryParameters({w: 'foo'}), /valid integer/)
  t.throws(() => mapQueryParameters({h: 'foo'}), /valid integer/)
  t.throws(() => mapQueryParameters({q: 'foo'}), /valid integer/)
  t.throws(() => mapQueryParameters({or: 'foo'}), /valid integer/)
  t.end()
})

test('[transforms] throws if passing floats to integer params', t => {
  t.throws(() => mapQueryParameters({w: '18.541'}), /valid integer/)
  t.throws(() => mapQueryParameters({h: '155.1'}), /valid integer/)
  t.throws(() => mapQueryParameters({q: '87.4'}), /valid integer/)
  t.throws(() => mapQueryParameters({or: '56.4'}), /valid integer/)
  t.end()
})

test('[transforms] throws if quality is out of range', t => {
  t.throws(() => mapQueryParameters({q: '800'}), /be between/)
  t.end()
})
