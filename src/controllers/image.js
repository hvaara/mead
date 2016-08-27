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

  sourceAdapter
    .getImageStream(urlPath)
    .on('error', handleError)
    .pipe(transformStream)
    .pipe(res)

  function handleError(err) {
    if (err.isBoom) {
      return next(err)
    }

    if (err.code === 'ENOENT') {
      return next(Boom.notFound('Image not found'))
    }

    return next(Boom.badImplementation(err))
  }
}
