module.exports = {
  type: 'response-handler',
  name: 'default-response-handler',
  handler: options => {
    const {response, headers, body} = options
    Object.keys(headers).forEach(header => {
      const value = headers[header]
      if (header.toLowerCase() === 'vary') {
        response.vary(value)
      } else {
        response.set(header, value)
      }
    })

    response.writeHead(200, 'OK')
    response.end(body)
  }
}
