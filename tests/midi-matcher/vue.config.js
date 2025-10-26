
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
};
