#!/usr/bin/env node
/* eslint-disable no-console */
const mead = require('..')
const config = require('../src/cli/init')

mead(config, (err, app) => {
  if (err) {
    throw err
  }

  app.listen(config.port, () => {
    console.log(`Mead running on http://${config.hostname}:${config.port}`)
  })
})
