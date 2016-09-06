const test = require('tape')
const request = require('supertest')
const {app} = require('./helpers')
const pkg = require('../package.json')

test('index route serves basic info', t => {
  app((err, mead) => {
    t.ifError(err)

    request(mead)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200, {service: pkg.name}, t.end)
  })
})
