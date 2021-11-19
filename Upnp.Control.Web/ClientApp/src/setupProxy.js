const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT
	? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
	: env.ASPNETCORE_URLS
		? env.ASPNETCORE_URLS.split(';')[0]
		: 'http://localhost:8080';

const context = [
	"/api",
	"/proxy",
	"/dlna-proxy"
];

module.exports = function (app) {

	app.use(createProxyMiddleware(context, {
		target,
		secure: false
	}));

	app.use(createProxyMiddleware("/upnpevents", {
		target,
		secure: false,
		ws: true
	}));
};