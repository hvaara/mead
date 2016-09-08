require('tape-chai')

const path = require('path')
const qs = require('querystring')
const pify = require('pify')
const sharp = require('sharp')
const request = require('supertest')
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
exports.appify = pify(exports.app)
exports.assertImageMeta = (res, target, t) => {
  if (!Buffer.isBuffer(res.body)) {
    t.fail(`Body is not a buffer: ${JSON.stringify(res.body)}`)
    t.end()
    return
  }

  sharp(res.body).metadata().then(info => {
    Object.keys(target).forEach(key => {
      t.equal(info[key], target[key], `same ${key}`)
    })

    t.end()
  })
}

exports.assertSize = (opts, assert, t) => {
  return (opts.mead ? opts.mead : exports.appify()).then(server => {
    request(server)
      .get(`/foo/images/${opts.fixture || '300x200.png'}?${qs.stringify(opts.query)}`)
      .expect(opts.statusCode || 200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'shouldnt error')
        exports.assertImageMeta(res, assert, t)
      })
  }).catch(err => {
    t.ifError(err, 'no error on boot')
    t.end()
  })
}
