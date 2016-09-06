require('tape-chai')

const sharp = require('sharp')
const path = require('path')
const mead = require('../..')
const getConfig = require('../../src/config')
const sources = [{
  name: 'foo',
  adapter: {
    type: 'fs',
    config: {
      basePath: path.join(__dirname, '..', 'fixtures')
    }
  }
}]

const config = exports.config = (cfg = {}) => getConfig(Object.assign({sources}, cfg))
exports.fixtures = require('../fixtures')
exports.app = (cfg, cb) => mead(cb ? config(cfg) : config(), cb || cfg)
exports.assertSize = (res, target, t) => {
  if (!Buffer.isBuffer(res.body)) {
    t.fail(`Body is not a buffer: ${JSON.stringify(res.body)}`)
    t.end()
    return
  }

  sharp(res.body).metadata().then(info => {
    Object.keys(target).forEach(key => {
      t.deepEqual(info[key], target[key], `same ${key}`)
    })

    t.end()
  })
}
