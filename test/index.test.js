const request = require('supertest')
const {app} = require('./helpers')
const pkg = require('../package.json')

jest.setTimeout(15000)

test('[index] index route serves basic info', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()

    request(mead)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200, {service: pkg.name}, done)
  })
})

test('[index] favicon route serves favicon', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()

    request(mead)
      .get('/favicon.ico')
      .expect('Content-Type', /icon/)
      .expect(200, done)
  })
})
