const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
function isValidDomain(domain) {
	const domainRegex =
		/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/;
	return domainRegex.test(domain);
}
function rewriteRelativeUrls(htmlContent, originalDomain) {
	const urlPattern = /(?:href|src|srcSet|srcset)="([^"]+)"/gi;

	return htmlContent.replace(urlPattern, (match, url) => {
		if (
			url.startsWith('http://') ||
			url.startsWith('https://') ||
			url.startsWith('//')
		) {
			return match;
		}

		if (match.toLowerCase().startsWith('srcset=')) {
			const urls = url.split(',').map((u) => u.trim());
			const rewrittenUrls = urls.map((u) => {
				const [relativeUrl, descriptor] = u.split(' ');
				return `${originalDomain}${relativeUrl} ${descriptor}`;
			});
			return `srcset="${rewrittenUrls.join(', ')}"`;
		}

		return match.replace(url, `${originalDomain}${url}`);
	});
}

function disableResources(htmlContent, disableOptions) {
	const $ = cheerio.load(htmlContent);

	if (disableOptions.includes('javascript') || disableOptions.includes('js')) {
		$('script').remove();
	}

	if (disableOptions.includes('css') || disableOptions.includes('style')) {
		$('link[rel="stylesheet"]').remove();
		$('style').remove();
	}

	if (disableOptions.includes('img') || disableOptions.includes('image')) {
		$('img').remove();
	}

	return $.html();
}

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
		const response = await fetch(url, options);

		const contentType = response.headers.get('content-type') || '';
		const isHtml = contentType.includes('text/html');
		const originalDomain = new URL(url).origin;
		const disable = (req.query.disable || '').toLowerCase().split('|');
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
				data = rewriteRelativeUrls(data, originalDomain);
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
