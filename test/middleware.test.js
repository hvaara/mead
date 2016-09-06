const test = require('tape')
const sourceAdapterLoader = require('../src/middleware/sourceAdapterLoader')
const sourceResolver = require('../src/middleware/sourceResolver')

test('source adapter loader errors if adapter type is not implemented', t => {
  sourceAdapterLoader(
    {app: {locals: {plugins: {source: {}}}}},
    {locals: {source: {adapter: {type: 'foo'}}}},
    err => {
      t.ok(err instanceof Error, 'is error')
      t.ok(err.message.includes('type "foo" not implemented'))
      t.end()
    }
  )
})

test('source resolver throws on unknown source mode', t => {
  t.throws(() => sourceResolver({
    locals: {
      config: {sourceMode: 'wat', sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: 'yup'}}
    }
  }), /unknown source mode/i)
  t.end()
})

test('source resolver can be set in vhost mode', t => {
  const srcHandler = subdomain => {
    t.equal(subdomain, 'my')
    t.end()
  }

  const resolver = sourceResolver({
    locals: {
      config: {sourceMode: 'vhost', sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: srcHandler}}
    }
  })

  resolver({hostname: 'my.sub.domain'})
})

test('source resolver can be set to a plain function', t => {
  const handler = () => {} // eslint-disable-line no-empty-function
  const resolver = sourceResolver({
    locals: {
      config: {sourceMode: handler, sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: 'a'}}
    }
  })

  t.equal(resolver, handler)
  t.end()
})

test('source resolver errors on missing source name in path mode', t => {
  const resolver = sourceResolver({
    locals: {
      config: {sourceMode: 'path', sourceResolver: 'foo'},
      plugins: {'source-resolver': {foo: 'a'}}
    }
  })

  resolver({url: 'moo'}, {}, err => {
    t.ok(err instanceof Error)
    t.end()
  })
})
