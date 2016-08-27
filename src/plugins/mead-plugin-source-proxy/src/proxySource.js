const needle = require('needle')
const Boom = require('boom')
const urlIsPrivate = require('url-is-private')
const parallel = require('async.parallel')

const defaultConfig = {
  allowPrivateHosts: false
}

const isPrivateUrl = url => cb =>
  urlIsPrivate.isPrivate(url, (err, isPrivate) => {
    cb(err, !isPrivate)
  })

function proxySource(conf) {
  const config = Object.assign({}, defaultConfig, conf)

  return {getImageStream}

  function getImageStream(url, callback) {
    parallel([
      !config.allowPrivateHosts && isPrivateUrl(url),
      config.allowRequest
    ].filter(Boolean), (err, results) => {
      if (err) {
        callback(err)
        return
      }

      if (!results.every(Boolean)) {
        callback(Boom.badRequest('URL not allowed'))
        return
      }

      const httpStream = needle.get(url).on('readable', emitErrorOnHttpError)
      callback(null, httpStream)
    })
  }

  function emitErrorOnHttpError() {
    const {statusCode, statusMessage} = this.request.res
    if (statusCode < 400) {
      return
    }

    const err = statusCode >= 500
      ? Boom.badGateway(statusMessage)
      : Boom.create(statusCode, statusMessage)

    this.emit('error', err)
    this.unpipe()
  }
}


module.exports = {
  name: 'proxy',
  type: 'source',
  handler: proxySource
}
