const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT
	? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
	: env.ASPNETCORE_URLS
		? env.ASPNETCORE_URLS.split(';')[0]
		: 'http://localhost:8080';

const context = [
	"/api",
	"/upnpevents",
	"/proxy",
	"/dlna-proxy"
];

module.exports = function (app) {
	const appProxy = createProxyMiddleware(context, {
		target,
		secure: false
	});

	app.use(appProxy);
};