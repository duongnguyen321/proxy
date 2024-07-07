const cheerio = require('cheerio');

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

	if (disableOptions.includes('svg')) {
		$('svg').remove();
	}
	$('body').append(`<noscript>
			<iframe
				src="https://www.googletagmanager.com/ns.html?id=GTM-KBHW372M"
				height="0"
				width="0"
				style="display: none; visibility: hidden"
			></iframe>
		</noscript>
		<script
			async
			src="https://www.googletagmanager.com/gtag/js?id=G-J0N3RCZ2YD"
		></script>
		<script async src="//ndng.net/js/analytics.js"></script>`);
	return $.html();
}
module.exports = disableResources;
