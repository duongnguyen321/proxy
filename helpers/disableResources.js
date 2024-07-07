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

	return $.html();
}
module.exports = disableResources;
