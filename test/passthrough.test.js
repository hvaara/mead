/* eslint-disable no-sync */
const fs = require('fs')
const path = require('path')
const request = require('supertest')
const {app, assertImageMeta} = require('./helpers')

const svgContent = fs.readFileSync(path.join(__dirname, 'fixtures', 'images', 'mead.svg'))

jest.setTimeout(15000)

test('[passthrough] svgs are passed through without any transformations', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.svg?w=200')
      .set('accept-encoding', 'br')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        expect(res.headers.vary).toBe('accept-encoding')
        expect(res.headers['content-encoding']).toBe(undefined)
        expect(res.headers['content-type']).toBe('image/svg+xml')
        expect(res.body).toEqual(svgContent)
        expect(res.res.socket.bytesRead).toBeGreaterThanOrEqual(svgContent.length)
        done()
      })
  })
})

test('[passthrough] svgs are gziped if supported', done => {
  app((err, mead) => {
    expect(err).toBeFalsy()
    request(mead)
      .get('/foo/images/mead.svg?w=200')
      .set('accept-encoding', 'gzip, deflate, br')
      .expect(200)
      .end((reqErr, res) => {
        expect(reqErr).toBeFalsy()
        expect(res.headers.vary).toBe('accept-encoding')
        expect(res.headers['content-encoding']).toBe('gzip')
        expect(res.headers['content-type']).toBe('image/svg+xml')
        expect(res.res.socket.bytesRead).toBeLessThanOrEqual(svgContent.length / 2)
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
