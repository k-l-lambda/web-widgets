
module.exports = {
	lintOnSave: false,
	chainWebpack: config => {
		// binary file loader
		config.module
			.rule("raw-binary")
			.test(/\.(mid)$/)
			.use("url-loader")
			.loader("url-loader");
	},
	configureWebpack: {
		watchOptions: {
			// Poll every second to detect changes in @k-l-lambda packages
			poll: 1000,
		},
		// Tell webpack not to ignore @k-l-lambda in node_modules
		snapshot: {
			managedPaths: [],
		},
	},
};
