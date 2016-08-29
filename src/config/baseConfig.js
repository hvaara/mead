const fsSource = require('mead-plugin-source-fs')
const proxySource = require('mead-plugin-source-proxy')
const webfolderSource = require('mead-plugin-source-webfolder')
const configSourceResolver = require('mead-plugin-source-resolver-config')

module.exports = {
  sources: [],
  sourceResolver: 'config',

  plugins: [
    configSourceResolver,
    fsSource,
    proxySource,
    webfolderSource
  ]
}
