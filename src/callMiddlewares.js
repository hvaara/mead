const noop = () => { /* noop */ }

module.exports = (handlers, options, onEmpty = noop) => {
  if (handlers.length === 0) {
    return onEmpty(options)
  }

  const middlewares = handlers.concat(onEmpty)

  let index = 0
  function callNext() {
    const middleware = middlewares[index++]
    middleware(options, callNext)
  }

  return callNext()
}
