#!/usr/bin/env node
/* eslint-disable no-console */
const app = require('..')
const config = require('../src/cli/init')

app(config).listen(config.port, () => {
  console.log(`Mead running on http://${config.hostname}:${config.port}`)
})
