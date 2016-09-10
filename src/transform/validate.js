/* eslint-disable id-length */
const Color = require('color')
const sharp = require('sharp')

const queryMap = {
  'w': ['width', int],
  'h': ['height', int],
  'q': ['quality', intBetween(0, 100)],
  'bg': ['backgroundColor', color],
  'fm': ['output', mime(enumz(['jpg', 'pjpg', 'png', 'webp']))],
  'rot': ['rotation', int, enumz([0, 90, 180, 270])],
  'flip': ['flip', enumz(['h', 'v', 'hv'])],
  'dl': ['download', identity],
  'fit': ['fit', enumz(['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min'])],
  'crop': ['crop', crop(['top', 'bottom', 'left', 'right', 'focalpoint', 'entropy'])],
  'trim': ['trim', enumz(['auto', 'color'])],
  'trimtol': ['trimTolerance', intBetween(1, 50)],
  'invert': ['invert', presenceBool],
  'sharp': ['sharpen', intBetween(1, 100)],
  'blur': ['blur', intBetween(1, 2000)],
  'pad': ['pad', int],
  'border': ['border', split, border],
  'rect': ['sourceRectangle', split, ints(4)],
  'fp-debug': ['focalPointTarget', presenceBool],
  'fp-x': ['focalPointX', numBetween(0, 1)],
  'fp-y': ['focalPointY', numBetween(0, 2)]
}

function validateTransforms(qs) {
  return Object.keys(qs).reduce((params, param) => {
    // Skip unrecognized parameters
    if (!queryMap[param]) {
      return params
    }

    const [name, ...validators] = queryMap[param]
    const value = validators.reduce(
      (result, validator) => validator(param, result),
      Array.isArray(qs[param]) ? qs[param][0] : qs[param]
    )

    params[name] = value
    return params
  }, {})
}

function split(param, input) {
  return input.split(',')
}

function border(param, input) {
  const [size, clr] = input
  return {
    size: int('border[0]', size),
    color: color('border[1]', clr)
  }
}

function identity(param, input) {
  return input
}

function num(param, value) {
  const val = Number(value)
  if (isNaN(val)) {
    throw new Error(`Parameter "${param}" must be a valid number`)
  }

  return val
}

function int(param, value) {
  const val = parseInt(value, 10)
  if (isNaN(val) || val !== Number(value)) {
    throw new Error(`Parameter "${param}" must be a valid integer`)
  }

  return val
}

function between(min, max, cast) {
  return (param, value) => {
    const val = cast(param, value)
    if (val < min || val > max) {
      throw new Error(`Parameter "${param}" must be between ${min} and ${max}`)
    }

    return val
  }
}

function numBetween(min, max) {
  return between(min, max, num)
}

function intBetween(min, max) {
  return between(min, max, int)
}

function ints(expectedLength) {
  return (param, input) => {
    if (input.length !== expectedLength) {
      throw new Error(`Parameter "${param}" takes ${expectedLength} integers in x,y,w,h format`)
    }

    return input.map((val, i) => int(`${param}[${i}]`, val))
  }
}

function getOneOf(values) {
  return `must be one of: [${values.map(quote).join(', ')}]`
}

function enumz(values) {
  return (param, value) => {
    if (!values.includes(value)) {
      throw new Error(`Parameter "${param}" - ${getOneOf(values)}`)
    }

    return value
  }
}

function presenceBool() {
  return true
}

function color(param, value) {
  const val = value.toLowerCase()
  if (!/^[a-f0-9]+$/.test(val)) {
    throw new Error(`Parameter "${param}" must be a valid hexadecimal color`)
  }

  const formats = ['rgb', 'argb', 'rrggbb', 'aarrggbb']
  const allowed = [3, 4, 6, 8]
  if (!allowed.includes(val.length)) {
    throw new Error(
      `Parameter "${param}" must be a valid hexadecimal color.\n`
      + `Allowed formats: ${formats.join(', ')}`
    )
  }

  if (val.length !== 4 && val.length !== 8) {
    return `#${val}`
  }

  // The color module that sharp uses doesn't recognize argb syntax,
  // so we have to help it translate
  const al = val.length === 4 ? 1 : 2
  const alp = val.substr(0, al)
  const base = val.substr(al)
  const alpha = alp.length === 1 ? alp[0] + alp[0] : alp
  return Color(`#${base}`).alpha(parseInt(alpha, 16) / 255).rgb()
}

function quote(str) {
  return `"${str}"`
}

function mime(formatter) {
  const formatMap = {
    jpg: 'jpeg',
    pjpg: 'jpeg'
  }

  return (...args) => {
    const format = formatter(...args)
    const progressive = format === 'pjpg'
    const normal = formatMap[format] || format

    return {
      format: normal,
      mime: `image/${normal}`,
      progressive
    }
  }
}

const cropPositionMap = {
  top: 'north',
  bottom: 'south',
  left: 'west',
  right: 'east'
}

function crop(values) {
  return (param, value) => {
    const modifiers = value.split(',')
    const gravity = modifiers
      .map(mapPositional)
      .filter(Boolean)
      .sort(sortPositional)
      .join('')

    return sharp.gravity[gravity] || modifiers.filter(mod => !mapPositional(mod)).shift()
  }

  function mapPositional(val) {
    if (!values.includes(val)) {
      throw new Error(`Value "${val}" not recognized for parameter "crop", ${getOneOf(values)}`)
    }

    return cropPositionMap[val] || false
  }

  function sortPositional(a, b) {
    if (a === b) {
      return 0
    }

    return a === 'north' || a === 'south' ? -1 : 1
  }
}

module.exports = validateTransforms
