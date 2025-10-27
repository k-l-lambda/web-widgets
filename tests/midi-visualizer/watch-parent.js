#!/usr/bin/env node

const chokidar = require("chokidar");
const {exec} = require("child_process");
const path = require("path");

const PARENT_ROOT = path.join(__dirname, "../../");
const PARENT_DIST = path.join(PARENT_ROOT, "dist");
const PARENT_LIB = path.join(PARENT_ROOT, "lib");

const LOCAL_ROOT = path.join(__dirname, "node_modules/@k-l-lambda/web-widgets");
const LOCAL_DIST = path.join(LOCAL_ROOT, "dist");
const LOCAL_LIB = path.join(LOCAL_ROOT, "lib");

console.log("👀 Watching parent package outputs (dist + lib)...");
console.log(`   Dist Source: ${PARENT_DIST}`);
console.log(`   Dist Target: ${LOCAL_DIST}`);
console.log(`   Lib  Source: ${PARENT_LIB}`);
console.log(`   Lib  Target: ${LOCAL_LIB}`);
console.log("");

function log(message) {
	const timestamp = new Date().toLocaleTimeString();
	console.log(`[${timestamp}] ${message}`);
}

function copyDistFiles() {
	log("📦 Copying dist files...");

	exec(`mkdir -p ${LOCAL_DIST} && cp ${PARENT_DIST}/musicWidgetsBrowser.* ${LOCAL_DIST}/`, (error) => {
		if (error) {
			log(`❌ Dist copy error: ${error.message}`);
			return;
		}
		log("✅ Dist files copied - browser will hot-reload!");
	});
}

function copyLibFolder() {
	log("📚 Syncing lib folder (compiled TS + MidiAudio)...");

	// Replace lib with fresh copy from parent
	exec(`rm -rf ${LOCAL_LIB} && mkdir -p ${LOCAL_LIB} && cp -r ${PARENT_LIB}/* ${LOCAL_LIB}/`, (error) => {
		if (error) {
			log(`❌ Lib copy error: ${error.message}`);
			return;
		}
		log("✅ Lib folder synced to node_modules.");
	});
}

// Watchers
const distWatcher = chokidar.watch(`${PARENT_DIST}/musicWidgetsBrowser.*`, {
	persistent: true,
	ignoreInitial: true,
});

const libWatcher = chokidar.watch(`${PARENT_LIB}/**/*`, {
	persistent: true,
	ignoreInitial: true,
});

distWatcher
	.on("ready", () => {
		log("✅ Dist watcher ready");
		log("🚀 Run 'yarn watch' in parent to auto-rebuild.");
	})
	.on("change", (filepath) => {
		log(`📝 Dist change: ${path.basename(filepath)}`);
		copyDistFiles();
	})
	.on("error", (error) => log(`❌ Dist watcher error: ${error.message}`));

libWatcher
	.on("ready", () => log("✅ Lib watcher ready"))
	.on("add", (filepath) => {
		log(`➕ Lib add: ${path.relative(PARENT_LIB, filepath)}`);
		copyLibFolder();
	})
	.on("change", (filepath) => {
		log(`📝 Lib change: ${path.relative(PARENT_LIB, filepath)}`);
		copyLibFolder();
	})
	.on("unlink", (filepath) => {
		log(`➖ Lib remove: ${path.relative(PARENT_LIB, filepath)}`);
		copyLibFolder();
	})
	.on("error", (error) => log(`❌ Lib watcher error: ${error.message}`));

process.on("SIGINT", () => {
	log("");
	log("👋 Stopping watch mode...");
	distWatcher.close();
	libWatcher.close();
	process.exit(0);
});
