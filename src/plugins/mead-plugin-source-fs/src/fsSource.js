const path = require('path')
const fs = require('fs')
const Boom = require('boom')

function fsSource(config) {
  if (!config.basePath) {
    throw new Error('`basePath` is required for `fs`-source to work')
  }

  return {getImageStream, requiresSignedUrls: false}

  function getImageStream(urlPath, callback) {
    const fsPath = path.sep === '/' ? urlPath : urlPath.replace(/\//g, path.sep)
    const imgPath = path.normalize(path.join(config.basePath, fsPath))

    if (imgPath.indexOf(config.basePath) !== 0) {
      setImmediate(callback, Boom.badRequest('Path points outside of base path'))
      return
    }

    setImmediate(callback, null, fs.createReadStream(imgPath))
  }
}


module.exports = {
  name: 'fs',
  type: 'source',
  handler: fsSource
}
