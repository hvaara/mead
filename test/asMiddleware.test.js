const path = require('path')
const express = require('express')
const request = require('supertest')
const getConfig = require('../src/config')
const mead = require('..')

test('[as middleware] allows mead to be mounted as middleware', done => {
  const app = express()
  app.get('/', (req, res) => res.json({my: 'app'}))
  app.use('/my/base', mead(getConfig({
    sources: [
      {
        name: 'test',
        adapter: {
          type: 'fs',
          config: {
            basePath: path.join(__dirname, 'fixtures')
          }
        }
      }
    ]
  })))

  request(app)
    .get('/')
    .expect(200, {my: 'app'}, () => {
      request(app)
        .get('/my/base/test/images/mead.png?w=100')
        .expect('Content-Type', 'image/png')
        .expect(200, done)
    })
})
