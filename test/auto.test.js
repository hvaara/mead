const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

jest.setTimeout(15000)

test('[auto] does not change format if webp is unsupported', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/320x180.png?auto=format')
      .expect(200)
      .expect('Vary', 'Accept')
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 320, height: 180, format: 'png'}, done)
      })
  })
})

test('[auto] converts to webp if supported, adds vary header', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/320x180.png?auto=format')
      .set('Accept', 'image/webp,image/apng,image/*,*/*;q=0.8')
      .expect(200)
      .expect('Vary', 'Accept')
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 320, height: 180, format: 'webp'}, done)
      })
  })
})
