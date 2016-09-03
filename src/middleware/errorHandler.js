/* eslint-disable no-process-env */
const Boom = require('boom')

// @todo add proper logging
module.exports = (err, req, res, next) => {
  const error = err.isBoom ? err : Boom.wrap(err)
  const isProduction = process.env.NODE_ENV === 'production'

  res
    .status(error.output.statusCode)
    .send(error.output.payload)

  /**
   * If we're not in production, pass errors on to be logged
   * If it's a server error, pass the error on to any late-attached error handlers
   */
  if (!isProduction || error.isServer) {
    next(error) // eslint-disable-line callback-return
  }
}
