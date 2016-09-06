const test = require('tape')
const mead = require('..')
const {fixtures, config} = require('./helpers')

test('errors if no sourceResolver is set', t => {
  mead({}, err => {
    t.instanceOf(err, Error)
    t.include(err.message, 'sourceResolver')
    t.end()
  })
})

test('errors if plugin fails to register', t => {
  mead({plugins: [fixtures.plugin({registerError: true})]}, err => {
    t.instanceOf(err, Error)
    t.equal(err.message, 'some error')
    t.end()
  })
})

test('errors if defined sourceResolver is not found', t => {
  mead({sourceResolver: 'foo'}, err => {
    t.instanceOf(err, Error)
    t.include(err.message, '"foo" not found')
    t.end()
  })
})

test('errors on duplicate plugin names within same type', t => {
  mead({plugins: [fixtures.plugin(), fixtures.plugin()]}, err => {
    t.instanceOf(err, Error)
    t.include(err.message, 'unique within a type')
    t.end()
  })
})

test('default config should error because of missing sources', t => {
  mead(config({sources: []}), err => {
    t.instanceOf(err, Error)
    t.include(err.message, 'No sources configured')
    t.end()
  })
})

test('errors on plugins without a name', t => {
  mead(config({plugins: [fixtures.plugin({name: ''})]}), err => {
    t.instanceOf(err, Error)
    t.include(err.message, "'name'-property")
    t.end()
  })
})

test('errors on plugins without a type', t => {
  mead(config({plugins: [fixtures.plugin({type: ''})]}), err => {
    t.instanceOf(err, Error)
    t.include(err.message, "'type'-property")
    t.end()
  })
})

test('errors on plugins without a handler', t => {
  mead(config({plugins: [fixtures.plugin({handler: ''})]}), err => {
    t.instanceOf(err, Error)
    t.include(err.message, "'handler'-property")
    t.end()
  })
})

test('errors on plugins with a non-function handler', t => {
  mead(config({plugins: [fixtures.plugin({handler: 'foo'})]}), err => {
    t.instanceOf(err, Error)
    t.include(err.message, 'not a function')
    t.end()
  })
})

test('given a source, default config should yield app', t => {
  mead(config({sources: [{name: 'foo', adapter: {type: 'proxy'}}]}), (err, app) => {
    t.ifError(err, 'no error')
    t.isFunction(app.listen)
    t.end()
  })
})

