/* eslint-disable no-console */
const Boom = require('boom')

// @todo add proper logging
module.exports = (err, req, res, next) => {
  const error = err.isBoom ? err : Boom.wrap(err)

  // If it's a 5xx we want to log it, and pass it on to any other error handlers
  if (error.isServer) {
    next(error)
    return
  }

  res.status(error.output.statusCode).send(error.output.payload)
}
