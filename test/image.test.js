const path = require('path')
const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

jest.setTimeout(15000)

test('[image] 404s on root source path', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead).get('/foo').expect(404, done)
  })
})

test('[image] 404s on root source path (alt)', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead).get('/foo/').expect(404, done)
  })
})

test('[image] image route serves plain image without transformations', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.png')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 512, height: 512}, done)
      })
  })
})

test('[image] image route serves image with orientation transformation', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/320x180.png?or=90')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 180, height: 320}, done)
      })
  })
})

test('[image] image route serves image with flip transformation (hv)', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/320x180.png?flip=hv')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 320, height: 180}, done)
      })
  })
})

test('[image] image route serves image with format change', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/320x180.png?fm=jpg')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 320, height: 180, format: 'jpeg'}, done)
      })
  })
})

test('[image] image route serves image as progressive jpeg', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/320x180.png?fm=pjpg')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 320, height: 180, format: 'jpeg'}, done)
      })
  })
})

test('[image] image route can be told to serve unsupported output formats as different format', done => {
  const inputFormatMap = {tiff: 'jpeg'}
  app({inputFormatMap}, (err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/tiff.tiff')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        assertImageMeta(res, {width: 100, height: 66, format: 'jpeg'}, done)
      })
  })
})

test('[image] image route serves image with flip transformation (h)', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead).get('/foo/images/320x180.png?flip=h').expect(200, done)
  })
})

test('[image] image route serves image with flip transformation (v)', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead).get('/foo/images/320x180.png?flip=v').expect(200, done)
  })
})

test('[image] 400s on invalid transformation params', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.png?w=foo')
      .expect('Content-Type', /json/)
      .expect(400, done)
  })
})

test('[image] 400s on invalid source rectangle coordinates', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.png?rect=256,256,512,512')
      .expect('Content-Type', /json/)
      .expect(400, done)
  })
})

test('[image] sends content-disposition if download flag is set', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.png?w=256&dl=gjøk.png')
      .expect('Content-Disposition', 'attachment;filename="gj%C3%B8k.png"')
      .expect(200, done)
  })
})

test('[image] sends correct cache-control when ttl is set on source', done => {
  const sources = [
    {
      name: 'foo',
      cache: {ttl: 3600},
      adapter: {
        type: 'fs',
        config: {basePath: path.join(__dirname, 'fixtures')}
      }
    }
  ]

  app({sources}, (err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.png')
      .expect('Cache-Control', /max-age=3600/)
      .expect(200, done)
  })
})

test('[image] sends correct cache-control when max age and shared max age is set on source', done => {
  const sources = [
    {
      name: 'foo',
      cache: {maxAge: 3600, sharedMaxAge: 86400},
      adapter: {
        type: 'fs',
        config: {basePath: path.join(__dirname, 'fixtures')}
      }
    }
  ]

  app({sources}, (err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.png')
      .expect('Cache-Control', /max-age=3600, s-maxage=86400/)
      .expect(200, done)
  })
})

test('[image] sends 415 on broken images', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead).get('/foo/images/broken-image.jpg').expect(415, done)
  })
})

test('[image] sends 415 on broken images (alt)', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead).get('/foo/images/slightly-broken-image.png').expect(415, done)
  })
})
