const path = require('path')
const isPlainObject = require('lodash/isPlainObject')
const getConfig = require('../config')

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .example('$0 -c config/config.js', 'use the passed config file')
  .alias('c', 'config')
  .nargs('c', 1)
  .describe('c', 'Configuration file')
  .help('h')
  .alias('h', 'help')
  .argv

let userConfig = {}
if (argv.config) {
  try {
    const cfgPath = path.isAbsolute(argv.config)
      ? argv.config
      : path.join(process.cwd(), argv.config)

    userConfig = require(cfgPath)
  } catch (err) {
    throw err
  }

  if (!isPlainObject(userConfig) && typeof userConfig !== 'function') {
    throw new Error('Configuration file must export a plain object or a function')
  }
}

module.exports = getConfig(userConfig)
