import fs from "fs";
import path from "path";

import * as MIDI from "../source/inc/MIDI";


const footagesDir = path.join(__dirname, "..", "footages");
const midiFiles = fs.readdirSync(footagesDir)
	.filter(name => /\.midi?$/i.test(name))
	.sort()
	.map(name => path.join(footagesDir, name));

console.assert(midiFiles.length > 0, "footages should contain MIDI files");

for (const file of midiFiles) {
	const source = fs.readFileSync(file);
	const midi = MIDI.parseMidiData(source);
	const encoded = Buffer.from(MIDI.encodeMidiFile(midi));

	if (!encoded.equals(source))
		throw new Error(`MIDI parse/encode roundtrip should preserve bytes: ${file}`);
	console.log("✓ MIDI roundtrip test passed", path.basename(file), `${source.length} bytes`, `${midi.tracks.length} track(s)`);
}
