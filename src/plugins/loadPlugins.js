const responsiveCallback = require('responsive-callback')
const validatePlugin = require('./validatePlugin')
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
  const config = app.locals.config
  const register = config.plugins.map(plugin => plugin.register).filter(Boolean)
  const registry = config.plugins.reduce(assignPlugin, {})

  setImmediate(series, {}, register, {app: app}, responsiveCallback(cbOpts, callback))

  return registry
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

