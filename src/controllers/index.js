const pkg = require('../../package.json')

module.exports = (req, res) => {
  res.json({service: pkg.name})
}
