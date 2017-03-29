/* eslint-disable no-process-env */
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
  ],

  cache: {
    ttl: process.env.NODE_ENV === 'production' ? 86400 : 0,
  },

  vips: {
    concurrency: 0, // 0 means number of cores
  },

  images: {
    maxSize: 8192,
    forceToFilenameFormat: false,
  },

  clientHints: {
    enabled: true,
    optIn: true,
    // false/0 means "dont use viewport scaling"
    viewportScale: 2
  }
}
