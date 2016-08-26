/* eslint-disable no-process-env */
const baseConfig = require('./baseConfig')

const OPTS_MATRIX = [
  ['port', 'PORT', 3999],
  ['hostname', 'HOSTNAME', '127.0.0.1'],
  ['requireSignedUrls', 'SIGNED_URLS', true],
  ['proxyTimeout', 'TIMEOUT', 15000]
]

const BOOL_OPTS = [
  'requireSignedUrls'
]

const normalizeBool = bool => {
  if (!bool) {
    return false
  }

  switch (bool.toString().toLowerCase()) {
    case '0':
    case 'false':
    case 'no':
    case 'off':
    case 'disabled':
      return false
    default:
      return true
  }
}

module.exports = config => {
  const configIsFunction = typeof config === 'function'
  const userConfig = configIsFunction ? {} : config
  const processConfig = configIsFunction ? config : cfg => cfg

  const result = Object.assign({}, baseConfig, userConfig)

  OPTS_MATRIX.forEach(opt => {
    const key = opt[0]

    // Do we have an environment variable sidekick?
    const env = opt[1] && `MEAD_${opt[1]}`

    let val
    if (!configIsFunction && key in userConfig) {
      val = userConfig[key]
    } else if (env && env in process.env) {
      val = process.env[env]
    } else if (opt.length === 3) {
      val = opt[2]
    }

    if (BOOL_OPTS.includes(key)) {
      val = normalizeBool(val)
    }

    if (val !== undefined) {
      result[key] = val
    }
  })

  return processConfig(result)
}
