function isValidDomain(domain) {
	const domainRegex =
		/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/;
	return domainRegex.test(domain);
}

module.exports = isValidDomain;
