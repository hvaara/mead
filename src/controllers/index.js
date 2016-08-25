const pkg = require('../../package.json')

module.exports = (req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version
  })
}
