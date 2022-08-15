const { createProxyMiddleware } = require('http-proxy-middleware')
const { env } = require('process')

const target = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
        ? env.ASPNETCORE_URLS.split(';')[0]
        : 'http://localhost:8080'

const options = {
    target,
    secure: false,
    onError: (error) => console.error(error.message)
}

module.exports = function (app) {
    app.use(createProxyMiddleware(["/api", "/proxy", "/dlna-proxy"],
        { ...options, headers: { Connection: 'Keep-Alive' } }));
    app.use(createProxyMiddleware("/upnpevents",
        { ...options, ws: true }));
}