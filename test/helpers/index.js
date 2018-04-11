const path = require('path')
const assert = require('assert')
const qs = require('querystring')
const pify = require('pify')
const sharp = require('sharp')
const request = require('supertest')
const getPixels = require('get-pixels')
const mead = require('../..')
const getConfig = require('../../src/config')
const sources = [
  {
    name: 'foo',
    adapter: {
      type: 'fs',
      config: {
        basePath: path.join(__dirname, '..', 'fixtures')
      }
    }
  }
]

const config = (cfg = {}) => getConfig(Object.assign({sources}, cfg))
exports.config = config
exports.fixtures = require('../fixtures')
exports.app = (cfg, cb) => mead(cb ? config(cfg) : config(), cb || cfg)
exports.appify = pify(exports.app)
exports.assertImageMeta = (res, target, done) => {
  if (!Buffer.isBuffer(res.body)) {
    done(new Error(`Body is not a buffer: ${JSON.stringify(res.body)}`))
    return
  }

  sharp(res.body).metadata().then(info => {
    Object.keys(target).forEach(key => {
      expect(info[key]).toEqual(target[key])
    })

    done()
  })
}

exports.assertSize = (opts, expected, done) => {
  return (opts.mead ? opts.mead : exports.appify()).then(server => {
    const req = request(server)
      .get(`/foo/images/${opts.fixture || '300x200.png'}?${qs.stringify(opts.query)}`)

    const headers = opts.headers || {}
    Object.keys(headers).forEach(header => {
      req.set(header, headers[header])
    })

    const resHeaders = opts.resHeaders || {}
    Object.keys(resHeaders).forEach(header => {
      req.expect(header, resHeaders[header])
    })

    req.expect(opts.statusCode || 200)
    req.end((reqErr, res) => {
      return reqErr
        ? done(reqErr)
        : exports.assertImageMeta(res, expected, done)
    })
  }).catch(done)
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

        img.colorAtIsApprox = (x, y, color, threshold = 12) => {
          const actualHex = img.colorAt(x, y)
          const actual = actualHex.match(/.{2}/g).map(decify)
          const target = color.match(/.{2}/g).map(decify)
          const distance = target.reduce((dist, col, i) => dist + Math.abs(col - actual[i]), 0)
          assert.ok(distance <= threshold, `color ${actualHex} out of range (${distance} > ${threshold})`)
        }

        img.colorAt = (x, y) => {
          const pixel = []
          const pointer = px.offset + (px.stride[0] * x) + (px.stride[1] * y)

          for (let i = 0; i < 3; i++) {
            pixel.push(px.data[pointer + (px.stride[2] * i)])
          }

          return pixel.map(hexify).join('')
        }

        resolve(img)
      })
    })
  })
}

function hexify(dec) {
  const hex = dec.toString(16)
  return dec < 16 ? `0${hex}` : hex
}

function decify(hex) {
  return parseInt(hex, 16)
}
