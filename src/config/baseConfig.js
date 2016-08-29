const fsSource = require('../plugins/mead-plugin-source-fs')
const s3Source = require('../plugins/mead-plugin-source-s3')
const proxySource = require('../plugins/mead-plugin-source-proxy')
const webfolderSource = require('../plugins/mead-plugin-source-webfolder')
const configSourceResolver = require('../plugins/mead-plugin-source-resolver-config')

module.exports = {
  sources: [],
  sourceResolver: 'config',

  plugins: [
    configSourceResolver,
    fsSource,
    s3Source,
    proxySource,
    webfolderSource
  ]
}
