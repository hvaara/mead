#!/usr/bin/env node
/* eslint-disable no-console */
const mead = require('..')
const config = require('../src/cli/init')

mead(config, (err, app) => {
  if (err) {
    throw err
  }

  app.listen(config.port, config.hostname, () => {
    console.log(`Mead running on http://${config.hostname}:${config.port}`)
  })
})

const signals = {
  SIGINT: 2,
  SIGTERM: 15
}

Object.keys(signals).forEach(signal => {
  process.on(signal, () => {
    console.log(`\nCaught ${signal}, exiting`)
    process.exit(128 + signals[signal]) // eslint-disable-line no-process-exit
  })
})
