/* eslint-disable id-length */
const Color = require('color')
const sharp = require('sharp')
const defaults = require('lodash/defaults')
const cloneDeep = require('lodash/cloneDeep')
const isUndefined = require('lodash/isUndefined')
const ValidationError = require('../errors/validationError')

const queryMap = [
  // Input operations
  ['rect', 'sourceRectangle', split, ints(4)],

  // Important to know if we are dealing with transparency or not
  ['fm', 'output', mime(enumz(['jpg', 'pjpg', 'png', 'webp']))],

  // Affects sizes throughout
  ['ch', 'clientHints', split, enumz(['Save-Data', 'Viewport-Width', 'Width', 'DPR'])],
  ['dpr', 'dpr', numBetween(0, 5), toFixed(2)],
  ['max-h', 'maxHeight', ifCrop(int)],
  ['max-w', 'maxWidth', ifCrop(int)],
  ['min-h', 'minHeight', ifCrop(int)],
  ['min-w', 'minWidth', ifCrop(int)],

  // Basic operations
  ['w', 'width', int],
  ['h', 'height', int],
  ['q', 'quality', intBetween(0, 100)],
  ['bg', 'backgroundColor', color],

  // Affects crop regions
  ['fp-x', 'focalPointX', numBetween(0, 1)],
  ['fp-y', 'focalPointY', numBetween(0, 2)],

  // Effects
  ['invert', 'invert', presenceBool],
  ['sharp', 'sharpen', intBetween(1, 100)],
  ['blur', 'blur', intBetween(1, 2000)],

  // Changes dimensions
  ['or', 'orientation', int, enumz([0, 90, 180, 270])],
  ['flip', 'flip', enumz(['h', 'v', 'hv'])],
  ['fit', 'fit', enumz(['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min'])],
  ['crop', 'crop', crop(['top', 'bottom', 'left', 'right', 'focalpoint', 'entropy'])],
  ['trim', 'trim', enumz(['auto', 'color'])],
  ['trimtol', 'trimTolerance', intBetween(1, 50)],
  ['pad', 'pad', int],

  // Overlays
  ['border', 'border', split, border],
  ['fp-debug', 'focalPointTarget', presenceBool],

  // Meta/header stuff
  ['dl', 'download', identity],
]

const defaultParameters = {
  dpr: 1,

  maxWidth: +Infinity,
  minWidth: -Infinity,
  maxHeight: +Infinity,
  minHeight: -Infinity,

  responseHeaders: {}
}

function mapQueryParameters(queryString) {
  const qs = queryMap.reduce((params, param) => {
    const [qParam] = param
    const val = queryString[qParam]
    if (!isUndefined(val) && isUndefined(params[qParam])) {
      params[qParam] = Array.isArray(val) ? val[0] : val
    }
    return params
  }, {})

  return defaults(queryMap.reduce((params, param) => {
    const [qParam, name, ...validators] = param
    if (isUndefined(qs[qParam])) {
      return params
    }

    const value = validators.reduce(
      (result, validator) => validator(qParam, result, params, qs),
      qs[qParam]
    )

    params[name] = value
    return params
  }, {}), cloneDeep(defaultParameters))
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

function toFixed(prec) {
  return (param, value) => {
    return Number(value.toFixed(prec))
  }
}

function num(param, value) {
  const val = Number(value)
  if (isNaN(val)) {
    throw new ValidationError(`Parameter "${param}" must be a valid number`)
  }

  return val
}

function int(param, value) {
  const val = parseInt(value, 10)
  if (isNaN(val) || val !== Number(value)) {
    throw new ValidationError(`Parameter "${param}" must be a valid integer`)
  }

  return val
}

function between(min, max, cast) {
  return (param, value) => {
    const val = cast(param, value)
    if (val < min || val > max) {
      throw new ValidationError(`Parameter "${param}" must be between ${min} and ${max}`)
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
      throw new ValidationError(`Parameter "${param}" takes ${expectedLength} integers in x,y,w,h format`)
    }

    return input.map((val, i) => int(`${param}[${i}]`, val))
  }
}

function getOneOf(values) {
  return `must be one of: [${values.map(quote).join(', ')}]`
}

function enumz(values) {
  return (param, value) => {
    (Array.isArray(value) ? value : [value]).forEach(val => {
      if (!values.includes(val)) {
        throw new ValidationError(`Parameter "${param}" - ${getOneOf(values)}`)
      }
    })

    return value
  }
}

function presenceBool() {
  return true
}

function ifCrop(validator) {
  return (param, value, params, qs) => {
    // @todo pre-normalize to non-arrays so this works
    return qs.fit === 'crop' ? validator(param, value) : undefined
  }
}

function color(param, value) {
  const val = value.toLowerCase()
  if (!/^[a-f0-9]+$/.test(val)) {
    throw new ValidationError(`Parameter "${param}" must be a valid hexadecimal color`)
  }

  const formats = ['rgb', 'argb', 'rrggbb', 'aarrggbb']
  const allowed = [3, 4, 6, 8]
  if (!allowed.includes(val.length)) {
    throw new ValidationError(
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
      throw new ValidationError(`Value "${val}" not recognized for parameter "crop", ${getOneOf(values)}`)
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

module.exports = mapQueryParameters
