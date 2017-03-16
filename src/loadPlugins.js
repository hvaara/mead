const responsiveCallback = require('responsive-callback')
const validatePlugin = require('./validators/plugin')
const flatten = require('lodash/flatten')
const series = require('fastseries')()

const cbOpts = {
  stream: true,
  messages: [
    'Waiting for plugins to register...',
    'Still waiting for plugins to register...',
    'Hrmph. Some plugin is not calling its `next()`-argument'
  ]
}

const loadPlugins = (app, callback) => {
  try {
    const plugins = flatten(app.locals.config.plugins || [])
    const register = plugins.map(plugin => plugin.register).filter(Boolean)
    const registry = plugins.reduce(assignPlugin, {})

    setImmediate(series, {}, register, {app: app}, responsiveCallback(cbOpts, callback))

    return registry
  } catch (err) {
    callback(err)
    return {}
  }
}

function assignPlugin(registry, plugin, index) {
  validatePlugin(plugin, index)

  const {type, handler, name} = plugin
  if (!registry[type]) {
    registry[type] = {}
  }

  if (registry[type][name]) {
    throw new Error(
      `More than one plugin of type "${type}" has a name of "${name}" - names must be unique within a type`
    )
  }

  registry[plugin.type][name] = handler
  return registry
}

module.exports = loadPlugins

