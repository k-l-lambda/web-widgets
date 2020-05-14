
module.exports = {
	//publicPath: "./",
	outputDir: "dist",
	filenameHashing: false,
	pages: {
		musicWidgets: {
			entry: "./index.js",
		},
		musicWidgetsBrowser: {
			entry: "./index.browser.js",
		},
	},
	css: {
		extract: false,
	},
};
