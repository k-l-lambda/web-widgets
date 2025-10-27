#!/usr/bin/env node

const { spawn, exec } = require("child_process");

function log(prefix, msg) {
	const ts = new Date().toLocaleTimeString();
	console.log(`[${ts}] [${prefix}] ${msg}`);
}

function copyMidiAudio() {
	log("COPY", "Syncing source/MidiAudio -> lib/MidiAudio");
	exec("mkdir -p lib && rm -rf lib/MidiAudio && cp -r source/MidiAudio lib/", (err) => {
		if (err)
			log("COPY", `Error: ${err.message}`);
		else
			log("COPY", "Done");
	});
}

// Start TypeScript compiler in watch mode
const tsc = spawn("tsc", ["-w", "--preserveWatchOutput"], { stdio: ["ignore", "pipe", "pipe"] });

tsc.stdout.on("data", (buf) => {
	const out = buf.toString();
	process.stdout.write(out);
	if (/Found \d+ error/.test(out) || /Watching for file changes/.test(out)) {
		copyMidiAudio();
	}
});

tsc.stderr.on("data", (buf) => process.stderr.write(buf.toString()));

tsc.on("exit", (code) => log("TSC", `Exited with code ${code}`));

// Start vue-cli-service build in watch mode (depends on lib outputs)
const vue = spawn("vue-cli-service", [
	"build",
	"--target", "lib",
	"--name", "musicWidgetsBrowser",
	"index.browser.js",
	"--watch",
], { stdio: "inherit" });

function shutdown() {
	log("WATCH", "Shutting down...");
	try { tsc.kill("SIGINT"); } catch {}
	try { vue.kill("SIGINT"); } catch {}
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
