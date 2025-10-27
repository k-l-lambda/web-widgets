#!/usr/bin/env node

const chokidar = require("chokidar");
const {exec} = require("child_process");
const path = require("path");

const PARENT_DIST = path.join(__dirname, "../../dist");
const LOCAL_DIST = path.join(__dirname, "node_modules/@k-l-lambda/web-widgets/dist");

console.log("👀 Watching parent package dist files...");
console.log(`   Source: ${PARENT_DIST}`);
console.log(`   Target: ${LOCAL_DIST}`);
console.log("");

function log(message) {
	const timestamp = new Date().toLocaleTimeString();
	console.log(`[${timestamp}] ${message}`);
}

function copyDistFiles() {
	log("📦 Copying dist files...");

	exec(`cp ${PARENT_DIST}/musicWidgetsBrowser.* ${LOCAL_DIST}/`, (error) => {
		if (error) {
			log(`❌ Error: ${error.message}`);
			return;
		}
		log("✅ Dist files copied - browser will hot-reload!");
		log("");
	});
}

// Watch parent dist directory for changes
const watcher = chokidar.watch(`${PARENT_DIST}/musicWidgetsBrowser.*`, {
	persistent: true,
	ignoreInitial: true,
});

watcher
	.on("ready", () => {
		log("✅ Watching started");
		log("");
		log("🚀 Watch mode active. Press Ctrl+C to stop.");
		log("   Run 'yarn watch' in parent directory to auto-rebuild on source changes.");
		log("");
	})
	.on("change", (filepath) => {
		log(`📝 Change detected: ${path.basename(filepath)}`);
		copyDistFiles();
	})
	.on("error", (error) => {
		log(`❌ Watcher error: ${error.message}`);
	});

process.on("SIGINT", () => {
	log("");
	log("👋 Stopping watch mode...");
	watcher.close().then(() => {
		process.exit(0);
	});
});
