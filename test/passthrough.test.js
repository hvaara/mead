const test = require('tape')
const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

test('[passthrough] svgs are passed through without any transformations', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/mead.svg?w=200')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        t.equals(res.headers['content-type'], 'image/svg+xml', 'svg content type')
        t.end()
      })
  })
})

test('[passthrough] gifs are passed through without any transformations', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/mead.gif?w=200')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        t.equals(res.headers['content-type'], 'image/gif', 'gif content type')
        assertImageMeta(res, {width: 512, height: 512}, t)
      })
  })
})
