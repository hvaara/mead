require('tape-chai')

const path = require('path')
const mead = require('../..')
const getConfig = require('../../src/config')
const sources = [{
  name: 'foo',
  adapter: {
    type: 'fs',
    basePath: path.join(__dirname, '..', 'fixtures')
  }
}]

const config = exports.config = (cfg = {}) => getConfig(Object.assign({sources}, cfg))
exports.fixtures = require('../fixtures')
exports.app = cb => mead(config({
  sources: [{
    name: 'foo',
    adapter: {
      type: 'fs'
    }
  }]
}), cb)
