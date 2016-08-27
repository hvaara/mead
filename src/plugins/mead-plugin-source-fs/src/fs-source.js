const path = require('path')
const fs = require('fs')
const Boom = require('boom')

const PassThrough = require('stream').PassThrough

const errStream = err => {
  const stream = new PassThrough()
  stream._read = () => stream.emit('error', err)
  return stream
}

function fsSource(config) {
  if (!config.basePath) {
    throw new Error('`basePath` is required for `fs`-source to work')
  }

  return {getImageStream}

  function getImageStream(urlPath) {
    const fsPath = path.sep === '/' ? urlPath : urlPath.replace(/\//g, path.sep)
    const imgPath = path.normalize(path.join(config.basePath, fsPath))

    if (imgPath.indexOf(config.basePath) !== 0) {
      return errStream(Boom.badRequest('Path points outside of base path'))
    }

    return fs.createReadStream(imgPath)
  }
}


module.exports = {
  name: 'fs',
  type: 'source',
  handler: fsSource
}
