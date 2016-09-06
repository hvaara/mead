const noop = () => {} // eslint-disable-line no-empty-function

module.exports = (opts = {}) => {
  return Object.assign({
    name: 'failing',
    type: 'unknown',
    handler: noop,
    register: opts.registerError ? (config, next) => {
      return next(new Error('some error'))
    } : undefined
  }, opts)
}
