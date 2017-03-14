const path = require('path')
const test = require('tape')
const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

test('[metadata-resolve] plugins allows overriding metadata resolving', t => {
  app({
    plugins: [{
      name: 'mock-meta',
      type: 'metadata-resolver',
      handler: mockResolve
    }]
  }, (err, mead) => {
    t.ifError(err, 'no error')
    request(mead)
      .get('/foo/images/320x180.png?or=90')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        assertImageMeta(res, {width: 180, height: 320}, t)
      })
  })
})

function mockResolve(context) {
  const urlPath = context.urlPath
  const extension = path.extname(urlPath)
  const fileName = path.basename(urlPath, extension)
  const match = fileName.match(/(\d+)x(\d+)$/)
  if (!match) {
    return false
  }

  const width = parseInt(match[1], 10)
  const height = parseInt(match[2], 10)
  const format = extension.replace(/^./, '').replace('jpg', 'jpeg')
  return {width, height, format}
}
