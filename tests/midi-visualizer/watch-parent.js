#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");

const PARENT_DIR = path.resolve(__dirname, "../../");
const PARENT_SOURCE_DIR = path.join(PARENT_DIR, "source");
const PARENT_DIST_DIR = path.join(PARENT_DIR, "dist");
const LOCAL_NODE_MODULES_DIST = path.join(__dirname, "node_modules/@k-l-lambda/web-widgets/dist");

let buildTimeout = null;
let isBuilding = false;

console.log("👀 Watching for changes in parent package...");
console.log(`   Source: ${PARENT_SOURCE_DIR}`);
console.log(`   Target: ${LOCAL_NODE_MODULES_DIST}`);
console.log("");

function log(message) {
	const timestamp = new Date().toLocaleTimeString();
	console.log(`[${timestamp}] ${message}`);
}

function copyDistFiles() {
	log("📦 Copying dist files to node_modules...");

	exec(`cp -v ${PARENT_DIST_DIR}/musicWidgetsBrowser.* ${LOCAL_NODE_MODULES_DIST}/`, (error, stdout, stderr) => {
		if (error) {
			log(`❌ Error copying files: ${error.message}`);
			return;
		}
		if (stderr) {
			log(`⚠️  ${stderr}`);
		}
		log("✅ Dist files copied successfully");
		log("   You may need to refresh your browser or restart the dev server");
		log("");
	});
}

function buildParent() {
	if (isBuilding) {
		log("⏳ Build already in progress, skipping...");
		return;
	}

	isBuilding = true;
	log("🔨 Building parent package...");

	exec("yarn build", {cwd: PARENT_DIR}, (error, stdout, stderr) => {
		isBuilding = false;

		if (error) {
			log(`❌ Build error: ${error.message}`);
			return;
		}

		log("✅ Build completed");
		copyDistFiles();
	});
}

function scheduleRebuild(filename) {
	log(`📝 Change detected: ${filename}`);

	if (buildTimeout) {
		clearTimeout(buildTimeout);
	}

	// Debounce: wait 1 second after last change before rebuilding
	buildTimeout = setTimeout(() => {
		buildParent();
	}, 1000);
}

function watchDirectory(dir) {
	try {
		fs.watch(dir, {recursive: true}, (eventType, filename) => {
			if (!filename) return;

			// Ignore non-source files
			if (filename.includes("node_modules")) return;
			if (filename.includes("dist")) return;
			if (filename.includes(".git")) return;
			if (filename.startsWith(".")) return;

			// Only watch .vue, .js, .ts files
			const ext = path.extname(filename);
			if (![".vue", ".js", ".ts"].includes(ext)) return;

			const fullPath = path.join(dir, filename);
			scheduleRebuild(filename);
		});

		log(`✅ Watching: ${dir}`);
	}
	catch (error) {
		log(`❌ Error watching ${dir}: ${error.message}`);
	}
}

// Watch the parent source directory
watchDirectory(PARENT_SOURCE_DIR);

// Watch index.browser.js
try {
	const indexFile = path.join(PARENT_DIR, "index.browser.js");
	fs.watch(indexFile, (eventType, filename) => {
		scheduleRebuild("index.browser.js");
	});
	log(`✅ Watching: ${indexFile}`);
}
catch (error) {
	log(`❌ Error watching index.browser.js: ${error.message}`);
}

log("");
log("🚀 Watch mode active. Press Ctrl+C to stop.");
log("");

// Keep the process running
process.on("SIGINT", () => {
	log("");
	log("👋 Stopping watch mode...");
	process.exit(0);
});
