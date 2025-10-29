import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
	plugins: [vue()],
	resolve: {
		extensions: [".ts", ".js", ".vue", ".json"],
	},
	build: {
		lib: {
			entry: resolve(__dirname, "index.browser.ts"),
			name: "musicWidgetsBrowser",
			formats: ["es", "umd"],
			fileName: (format) => `musicWidgetsBrowser.${format}.js`,
		},
		rollupOptions: {
			// Externalize deps that shouldn't be bundled
			external: ["vue"],
			output: {
				// Global vars to use in UMD build for externalized deps
				globals: {
					vue: "Vue",
				},
			},
		},
		sourcemap: true,
	},
});
