module.exports = {
  type: 'response-handler',
  name: 'default-response-handler',
  handler: options => {
    const {response, headers, data} = options
    response.writeHead(200, 'OK', headers)
    response.end(data)
  }
}
