const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rewriteUrl = require('./helpers/rewriteUrl');
const isValidDomain = require('./helpers/isValidDomain');
const disableResources = require('./helpers/disableResources');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', async (req, res) => {
	try {
		let domain = req.params[0].slice(1);
		if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
			domain = 'http://' + domain;
		}
		if (Object.keys(req?.query).length) {
			domain = domain + '?' + new URLSearchParams(req.query).toString();
		}
		const requestedUrl = new URL(domain);
		if (requestedUrl.hostname === 'favicon.ico') {
			return res.status(204).end();
		}

		if (!isValidDomain(requestedUrl.hostname)) {
			return res
				.status(404)
				.sendFile(path.join(__dirname, 'public', '404.html'));
		}

		const url = requestedUrl.href;
		const options = {
			method: req.method,
			headers: {
				'Content-Type': 'application/json',
				...req.headers,
			},
		};
		if (req.method !== 'GET') {
			options.body = JSON.stringify(req.body);
		}

		const headersToSet = {};
		if (req.query.headers) {
			const headerEntries = Array.isArray(req.query.headers)
				? req.query.headers
				: [req.query.headers];
			for (const entry of headerEntries) {
				const [key, value] = entry.split(':');
				if (key && value) {
					headersToSet[key] = value;
				}
			}
		}
		const response = await fetch(url, options);

		const contentType = response.headers.get('content-type') || '';
		const isHtml = contentType.includes('text/html');
		const originalDomain = new URL(url).origin;
		const disable = (req.query.disable || '').toLowerCase().split('|');
		for (const [key, value] of Object.entries(headersToSet)) {
			res.setHeader(key, value);
		}
		if (contentType.includes('application/json')) {
			try {
				const data = await response.json();
				res.status(response.status);
				res.setHeader('Content-Type', 'application/json');
				res.send(data);
			} catch (jsonError) {
				console.error('Error parsing JSON:', jsonError);
				res
					.status(500)
					.sendFile(path.join(__dirname, 'public', 'error-json.html'));
			}
		} else {
			let data = await response.text();
			if (isHtml) {
				data = rewriteUrl(data, originalDomain);
				data = disableResources(data, disable);
			}
			res.status(response.status);
			res.setHeader('Content-Type', contentType || 'text/plain');
			res.send(data);
		}
	} catch (error) {
		console.error('Error fetching data:', error);
		const errorPage = 'error.html';
		res.status(500).sendFile(path.join(__dirname, 'public', errorPage));
	}
});

app.listen(PORT, () => {
	console.info(`Proxy server running on port ${PORT}`);
});
