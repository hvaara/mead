const Boom = require('boom')
const transformer = require('../transform/transformer')

module.exports = (req, res, next) => {
  const {sourceAdapter} = res.locals
  const urlPath = req.params['0']
  const transformStream = transformer(req, res)

  if (transformStream instanceof Error) {
    next(Boom.badRequest(transformStream))
    return
  }

  sourceAdapter.getImageStream(urlPath, (err, stream) => {
    if (err) {
      handleError(err)
      return
    }

    stream
      .on('error', handleError)
      .pipe(transformStream)
      .on('error', handleError)
      .pipe(res)
  })

  function handleError(err) {
    if (err.isBoom) {
      return next(err)
    }

    return next(Boom.badImplementation(err))
  }
}
