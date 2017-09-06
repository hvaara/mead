module.exports = {
  type: 'response-handler',
  name: 'default-response-handler',
  handler: options => {
    const {response, headers, body} = options
    response.writeHead(200, 'OK', headers)
    response.end(body)
  }
}
