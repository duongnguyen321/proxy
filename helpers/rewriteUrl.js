function rewriteUrl(htmlContent, originalDomain) {
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

module.exports = rewriteUrl;
