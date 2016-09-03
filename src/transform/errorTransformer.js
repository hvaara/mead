const Boom = require('boom')

const matchers = [
  ['unsupported image format', Boom.unsupportedMediaType],
  ['buffer has corrupt header', Boom.unsupportedMediaType]
]

module.exports = err => {
  for (let i = 0, matcher; matcher = matchers[i]; i++) { // eslint-disable-line no-cond-assign
    const [substring, handler] = matcher
    if (err.message.includes(substring)) {
      return handler()
    }
  }

  return err.isBoom ? err : Boom.badImplementation(err)
}
