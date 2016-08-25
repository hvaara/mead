/* eslint-disable no-process-env */
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

module.exports = options => {
  const opts = options || {}
  const result = Object.assign({}, opts)

  OPTS_MATRIX.forEach(opt => {
    const key = opt[0]

    // Do we have an environment variable sidekick?
    const env = opt[1] && `MEAD_${opt[1]}`

    let val
    if (key in opts) {
      val = opts[key]
    } else if (env && env in process.env) {
      val = process.env[env]
    } else if (typeof opt[2] === 'function') {
      val = opt[2](result)
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

  return result
}
