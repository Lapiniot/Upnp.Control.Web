const { createProxyMiddleware } = require('http-proxy-middleware');

const context = [
	"/api",
	"/upnpevents",
	"/proxy",
	"/dlna-proxy"
];

module.exports = function (app) {
	const appProxy = createProxyMiddleware(context, {
		target: 'http://localhost:8080',
		secure: false
	});

	app.use(appProxy);
};