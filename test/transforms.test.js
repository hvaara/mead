const test = require('tape')
const validate = require('../src/transform/validate')

test('[transforms] translates `w` param into numeric `width`', t => {
  const {width} = validate({w: '1024'})
  t.equal(width, 1024)
  t.end()
})

test('[transforms] skips unknown params', t => {
  const params = validate({w: '1024', foo: 'bar'})
  t.equal(Object.keys(params).length, 1)
  t.equal(Object.keys(params)[0], 'width')
  t.end()
})

test('[transforms] translates `h` param into numeric `height`', t => {
  const {height} = validate({h: '768'})
  t.equal(height, 768)
  t.end()
})

test('[transforms] translates `q` param into numeric `quality`', t => {
  const {quality} = validate({q: '90'})
  t.equal(quality, 90)
  t.end()
})

test('[transforms] translates `rot` param into numeric `rotation`', t => {
  const {rotation} = validate({rot: '90'})
  t.equal(rotation, 90)
  t.end()
})

test('[transforms] throws if `rot` param is not 0, 90, 180 or 270', t => {
  t.throws(() => validate({rot: '15.3'}), /must be one of/)
  t.throws(() => validate({rot: '90.1'}), /must be one of/)
  t.end()
})

test('[transforms] translates `fm` param into object `output`', t => {
  const {output} = validate({fm: 'pjpg'})
  t.deepEqual(output, {format: 'jpeg', mime: 'image/jpeg', progressive: true})
  t.end()
})

test('[transforms] translates `fm` param into object `output` (alt)', t => {
  const {output} = validate({fm: 'png'})
  t.deepEqual(output, {format: 'png', mime: 'image/png', progressive: false})
  t.end()
})

test('[transforms] translates `dl` param into `download`', t => {
  const {download} = validate({dl: 'mahfile.png'})
  t.equal(download, 'mahfile.png')
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor`', t => {
  const {backgroundColor} = validate({bg: 'ccddee'})
  t.equal(backgroundColor, '#ccddee')
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor` (alpha included)', t => {
  const {backgroundColor} = validate({bg: 'aaccddee'})
  t.deepEqual(backgroundColor, {a: 2 / 3, b: 238, g: 221, r: 204})
  t.end()
})

test('[transforms] translates `bg` param into `backgroundColor` (alpha included - alt)', t => {
  const {backgroundColor} = validate({bg: 'acde'})
  t.deepEqual(backgroundColor, {a: 2 / 3, b: 238, g: 221, r: 204})
  t.end()
})

test('[transforms] throws if `bg` param is not in hex format', t => {
  t.throws(() => validate({bg: '255,128,131'}), /hexadecimal/)
  t.end()
})

test('[transforms] throws if `bg` param is not in known hex format', t => {
  t.throws(() => validate({bg: 'cdebc'}), /hexadecimal/i)
  t.throws(() => validate({bg: 'cdebc'}), /allowed formats/i)
  t.end()
})

test('[transforms] throws if passing non-numbers to numeric params', t => {
  t.throws(() => validate({w: 'foo'}), /valid number/)
  t.throws(() => validate({h: 'foo'}), /valid number/)
  t.throws(() => validate({q: 'foo'}), /valid number/)
  t.throws(() => validate({rot: 'foo'}), /valid number/)
  t.end()
})

test('[transforms] throws if quality is out of range', t => {
  t.throws(() => validate({q: '800'}), /be between/)
  t.end()
})

test('[transforms] includes all passed, recognized props in output', t => {
  const input = {
    w: '13',
    h: '14',
    q: '15',
    rot: '90',
    fm: 'png',
    bg: 'bf1942'
  }

  const output = validate(input)
  t.equal(Object.keys(output).length, Object.keys(input).length)
  t.end()
})
