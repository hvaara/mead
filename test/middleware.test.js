const sourceAdapterLoader = require('../src/middleware/sourceAdapterLoader')
const sourceResolver = require('../src/middleware/sourceResolver')

jest.setTimeout(15000)

test('[middleware] source adapter loader errors if adapter type is not implemented', done => {
  sourceAdapterLoader(
    {app: {locals: {plugins: {source: {}}}}},
    {locals: {source: {adapter: {type: 'foo'}}}},
    err => {
      expect(err instanceof Error).toBeTruthy()
      expect(err.message.includes('type "foo" not implemented')).toBeTruthy()
      done()
    }
  )
})

test('[middleware] source resolver throws on unknown source mode', () => {
  expect(() => sourceResolver({
    locals: {
      config: {sourceMode: 'wat', sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: 'yup'}}
    }
  })).toThrowError(/unknown source mode/i)
})

test('[middleware] source resolver can be set in vhost mode', done => {
  const srcHandler = subdomain => {
    expect(subdomain).toBe('my')
    done()
  }

  const resolver = sourceResolver({
    locals: {
      config: {sourceMode: 'vhost', sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: srcHandler}}
    }
  })

  resolver({hostname: 'my.sub.domain'})
})

test('[middleware] source resolver can be set to a plain function', () => {
  const handler = () => {} // eslint-disable-line no-empty-function
  const resolver = sourceResolver({
    locals: {
      config: {sourceMode: handler, sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: 'a'}}
    }
  })

  expect(resolver).toBe(handler)
})

test('[middleware] source resolver errors on missing source name in path mode', done => {
  const resolver = sourceResolver({
    locals: {
      config: {sourceMode: 'path', sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: 'a'}}
    }
  })

  resolver({url: 'moo'}, {}, err => {
    expect(err instanceof Error).toBeTruthy()
    done()
  })
})
