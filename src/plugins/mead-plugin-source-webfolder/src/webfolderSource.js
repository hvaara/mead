const url = require('url')
const proxySource = require('../../mead-plugin-source-proxy').handler

function webfolderSource(config) {
  if (!config.baseUrl) {
    throw new Error('Webfolder sources require a `baseUrl`-property')
  }

  if (!/^https?:\/\//i.test(config.baseUrl)) {
    throw new Error('Webfolder source `baseUrl`-property must be an HTTP/HTTPS url')
  }

  const baseUrl = `${config.baseUrl}/`.replace(/\/+$/, '/')
  const proxy = proxySource({
    // Since the user is specifying the base URL himself, allow private hosts
    allowPrivateHosts: true,
    allowRequest: config.allowRequest
  })

  return {getImageStream}

  function getImageStream(path, callback) {
    const imageUrl = url.resolve(baseUrl, path)
    proxy.getImageStream(imageUrl, callback)
  }
}

module.exports = {
  name: 'webfolder',
  type: 'source',
  handler: webfolderSource
}
