const url = require('url')
const Boom = require('boom')
const proxySource = require('../../mead-plugin-source-proxy')
const httpPattern = /^https?:\/\//i

function webfolderSource(config) {
  if (!config.baseUrl) {
    throw new Error('Webfolder sources require a `baseUrl`-property')
  }

  if (!httpPattern.test(config.baseUrl)) {
    throw new Error('Webfolder source `baseUrl`-property must be an HTTP/HTTPS url')
  }

  const baseUrl = url.parse(`${config.baseUrl}/`.replace(/\/+$/, '/'))

  return {getImageStream, requiresSignedUrls: false}

  function getImageStream(urlPath, callback) {
    const imageUrl = url.format(Object.assign({}, baseUrl, {
      pathname: url.resolve(baseUrl.pathname, urlPath)
    }))

    if (imageUrl.indexOf(config.baseUrl) !== 0) {
      callback(Boom.notFound('Image not found'))
      return
    }

    proxySource.getImageStream({
      // Since the user is specifying the base URL himself, allow private hosts
      allowPrivateHosts: true,
      allowRequest: config.allowRequest
    }, imageUrl, callback)
  }
}

module.exports = {
  name: 'webfolder',
  type: 'source',
  handler: webfolderSource
}
