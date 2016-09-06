module.exports = (plugin, index) => {
  if (!plugin.name) {
    throw new Error(`Plugin at index ${index} did not contain a 'name'-property`)
  }

  if (!plugin.type) {
    throw new Error(`Plugin with name "${plugin.name}" did not specify a 'type'-property`)
  }

  if (!plugin.handler) {
    throw new Error(`Plugin with name "${plugin.name}" did not specify a 'handler'-property`)
  }

  if (typeof plugin.handler !== 'function') {
    throw new Error(`Plugin with name "${plugin.name}" specified a handler which was not a function`)
  }
}
