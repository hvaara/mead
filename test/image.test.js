const path = require('path')
const test = require('tape')
const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

test('[image] 404s on root source path', t => {
  app((err, mead) => {
    t.ifError(err)
    request(mead).get('/foo').expect(404, t.end)
  })
})

test('[image] 404s on root source path (alt)', t => {
  app((err, mead) => {
    t.ifError(err)
    request(mead).get('/foo/').expect(404, t.end)
  })
})

test('[image] image route serves plain image without transformations', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/mead.png')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        assertImageMeta(res, {width: 512, height: 512}, t)
      })
  })
})

test('[image] image route serves image with orientation transformation', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/320x180.png?or=90')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        assertImageMeta(res, {width: 180, height: 320}, t)
      })
  })
})

test('[image] image route serves image with flip transformation (hv)', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/320x180.png?flip=hv')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        assertImageMeta(res, {width: 320, height: 180}, t)
      })
  })
})

test('[image] image route serves image with format change', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/320x180.png?fm=jpg')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        assertImageMeta(res, {width: 320, height: 180, format: 'jpeg'}, t)
      })
  })
})

test('[image] image route serves image as progressive jpeg', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/320x180.png?fm=pjpg')
      .expect(200)
      .end((reqErr, res) => {
        t.ifError(reqErr, 'no error')
        assertImageMeta(res, {width: 320, height: 180, format: 'jpeg'}, t)
      })
  })
})

test('[image] image route serves image with flip transformation (h)', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead).get('/foo/images/320x180.png?flip=h').expect(200, t.end)
  })
})

test('[image] image route serves image with flip transformation (v)', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead).get('/foo/images/320x180.png?flip=v').expect(200, t.end)
  })
})

test('[image] 400s on invalid transformation params', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/mead.png?w=foo')
      .expect('Content-Type', /json/)
      .expect(400, t.end)
  })
})

test('[image] 400s on invalid source rectangle coordinates', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/mead.png?rect=256,256,512,512')
      .expect('Content-Type', /json/)
      .expect(400, t.end)
  })
})

test('[image] sends content-disposition if download flag is set', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/mead.png?w=256&dl=gjøk.png')
      .expect('Content-Disposition', 'attachment;filename="gj%C3%B8k.png"')
      .expect(200, t.end)
  })
})

test('[image] sends correct cache-control when ttl is set on source', t => {
  const sources = [{
    name: 'foo',
    cache: {ttl: 3600},
    adapter: {
      type: 'fs',
      config: {basePath: path.join(__dirname, 'fixtures')}
    }
  }]

  app({sources}, (err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead)
      .get('/foo/images/mead.png')
      .expect('Cache-Control', /max\-age=3600/)
      .expect(200, t.end)
  })
})

test('[image] sends 415 on broken images', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead).get('/foo/images/broken-image.jpg').expect(415, t.end)
  })
})

test('[image] sends 415 on broken images (alt)', t => {
  app((err, mead) => {
    t.ifError(err, 'no error on boot')
    request(mead).get('/foo/images/slightly-broken-image.png').expect(415, t.end)
  })
})
