import fs from "fs";
import path from "path";

import * as MIDI from "../source/inc/MIDI";
import { midiToText, textToMidi } from "../source/inc/MidiText";


const footagesDir = path.join(__dirname, "..", "footages");
const midiFiles = fs.readdirSync(footagesDir)
	.filter(name => /\.midi?$/i.test(name))
	.sort()
	.map(name => path.join(footagesDir, name));

console.assert(midiFiles.length > 0, "footages should contain MIDI files");


// Order-insensitive event signature, dropping wire-only fields that carry no musical
// meaning: `running` (running-status compression), `metaSubtypeByte`/`channelEventType`
// (status-byte bookkeeping reconstructed from `subtype` on encode). mido's text dump
// likewise discards running status, so byte-identity is NOT the right invariant —
// semantic event-stream identity is.
const sig = (e: any): string => {
	const { running, metaSubtypeByte, channelEventType, ...rest } = e;
	return JSON.stringify(Object.keys(rest).sort().map(k => [k, rest[k]]));
};

const tracksEqual = (a: MIDI.MidiTrack, b: MIDI.MidiTrack): boolean =>
	a.length === b.length && a.every((e, i) => sig(e) === sig(b[i]));

const countNotes = (midi: MIDI.MidiData): number =>
	midi.tracks.reduce((sum, track) =>
		sum + track.filter(e => e.subtype === "noteOn" || e.subtype === "noteOff").length, 0);


for (const file of midiFiles) {
	const source = fs.readFileSync(file);
	const midi = MIDI.parseMidiData(source);

	// 1) per-track round-trip: midi -> text -> midi must preserve every event semantically
	const text = midiToText(midi);
	const restored = textToMidi(text);
	if (midi.tracks.length !== restored.tracks.length)
		throw new Error(`MidiText round-trip changed track count: ${file}`);
	midi.tracks.forEach((track, t) => {
		if (!tracksEqual(track, restored.tracks[t]))
			throw new Error(`MidiText round-trip should preserve track ${t} events: ${file}`);
	});

	// 2) the restored data must still encode to a valid, re-parseable MIDI file
	MIDI.parseMidiData(Buffer.from(MIDI.encodeMidiFile(restored)));

	// 3) text idempotency: text -> midi -> text is a fixed point
	if (midiToText(restored) !== text)
		throw new Error(`MidiText round-trip should be idempotent: ${file}`);

	// 4) mix mode: merges tracks (lossy on boundaries) but keeps every note event,
	//    yields a single track, and is itself idempotent.
	const mixedText = midiToText(midi, { mix: true });
	const mixedMidi = textToMidi(mixedText);
	if (mixedMidi.tracks.length !== 1)
		throw new Error(`MidiText mix should yield a single track: ${file}`);
	if (countNotes(mixedMidi) !== countNotes(midi))
		throw new Error(`MidiText mix should preserve all note events: ${file}`);
	if (midiToText(mixedMidi, { mix: true }) !== mixedText)
		throw new Error(`MidiText mix should be idempotent: ${file}`);

	console.log("✓ MidiText round-trip passed", path.basename(file),
		`${source.length} bytes`, `${midi.tracks.length} track(s)`, `${countNotes(midi)} note events`);
}

console.log(`\n${midiFiles.length} file(s) passed MidiText round-trip (semantic per-track + mix note-preserving).`);
