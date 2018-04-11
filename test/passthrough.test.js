const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

jest.setTimeout(15000)

test('[passthrough] svgs are passed through without any transformations', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.svg?w=200')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        expect(res.headers['content-type']).toBe('image/svg+xml')
        done()
      })
  })
})

test('[passthrough] gifs are passed through without any transformations', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.gif?w=200')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        expect(res.headers['content-type']).toBe('image/gif')
        assertImageMeta(res, {width: 512, height: 512}, done)
      })
  })
})
