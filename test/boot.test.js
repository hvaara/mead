const mead = require('..')
const {fixtures, config} = require('./helpers')

jest.setTimeout(15000)

test('[boot] errors if no sourceResolver is set', done => {
  mead({}, err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain('sourceResolver')
    done()
  })
})

test('[boot] errors if plugin fails to register', done => {
  mead({plugins: [fixtures.plugin({registerError: true})]}, err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('some error')
    done()
  })
})

test('[boot] errors if defined sourceResolver is not found', done => {
  mead({sourceResolver: 'foo'}, err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain('"foo" not found')
    done()
  })
})

test('[boot] errors on duplicate plugin names within same type', done => {
  mead({plugins: [fixtures.plugin(), fixtures.plugin()]}, err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain('unique within a type')
    done()
  })
})

test('[boot] default config should error because of missing sources', done => {
  mead(config({sources: []}), err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain('No sources configured')
    done()
  })
})

test('[boot] errors on plugins without a name', done => {
  mead(config({plugins: [fixtures.plugin({name: ''})]}), err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain("'name'-property")
    done()
  })
})

test('[boot] errors on plugins without a type', done => {
  mead(config({plugins: [fixtures.plugin({type: ''})]}), err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain("'type'-property")
    done()
  })
})

test('[boot] errors on plugins without a handler', done => {
  mead(config({plugins: [fixtures.plugin({handler: ''})]}), err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain("'handler'-property")
    done()
  })
})

test('[boot] errors on plugins with a non-function handler', done => {
  mead(config({plugins: [fixtures.plugin({handler: 'foo'})]}), err => {
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toContain('not a function')
    done()
  })
})

test('[boot] given a source, default config should yield app', done => {
  mead(config({sources: [{name: 'foo', adapter: {type: 'proxy'}}]}), (err, app) => {
    expect(err).toBeFalsy()
    expect(typeof app.listen).toBe('function')
    done()
  })
})

