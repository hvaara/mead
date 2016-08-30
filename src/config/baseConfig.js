const md5Signature = require('mead-plugin-signature-md5')
const fsSource = require('mead-plugin-source-fs')
const proxySource = require('mead-plugin-source-proxy')
const webfolderSource = require('mead-plugin-source-webfolder')
const configSourceResolver = require('mead-plugin-source-resolver-config')

module.exports = {
  sources: [],
  sourceResolver: 'config',

  plugins: [
    md5Signature,
    configSourceResolver,
    fsSource,
    proxySource,
    webfolderSource
  ]
}
