require('tape-chai')

const path = require('path')
const qs = require('querystring')
const pify = require('pify')
const sharp = require('sharp')
const request = require('supertest')
const getPixels = require('get-pixels')
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

exports.readImage = imgPath => {
  return exports.appify().then(server => new Promise((resolve, reject) => {
    request(server)
      .get(`/foo/images/${imgPath}`)
      .expect(200)
      .end((err, res) => {
        return err ? reject(err) : resolve(imgify(res.body))
      })
  }))
}

function imgify(body) {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(body)) {
      reject(new Error(`Body is not a buffer: ${JSON.stringify(body)}`))
      return
    }

    const img = {}
    sharp(body).png().toBuffer((err, data, info) => {
      if (err) {
        reject(err)
        return
      }

      img.width = info.width
      img.height = info.height

      getPixels(data, `image/${info.format}`, (imgErr, px) => {
        if (imgErr) {
          reject(imgErr)
          return
        }

        img.colorAt = (x, y) => {
          const pixel = px.pick(x, y).data.slice(0, 3)
          return pixel.map(dec => dec.toString(16)).join('')
        }

        resolve(img)
      })
    })
  })
}
