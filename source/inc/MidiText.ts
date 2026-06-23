/*
Text codec for MIDI, in the spirit of mido's message dump (cf. CLaMP 3 MTF).

Each event is one line:  <token> <deltaTime> <field...>
  note_on 5 0 3c 45            // delta=5, channel=0, note=0x3c(60), velocity=0x45(69)
  set_tempo 0 7a120            // delta=0, microsecondsPerBeat=0x7a120(500000)
  track_name 0 Grand Piano     // delta=0, text (rest of the line)

All numeric values are in hexadecimal (lower-case, no 0x prefix; negatives as "-1f").
Token names follow mido (note_on/control_change/set_tempo/...). NOTE one deviation
from mido: deltaTime is ALWAYS the first field after the token (mido puts `time`
last on meta messages); a fixed position keeps the format consistent and trivially
parseable in both directions.

The body is grouped into tracks by `track <i>` marker lines, preceded by a
`ticks_per_beat <n>` / `format_type <n>` header. `midiToText(.., {mix:true})`
merges every track into one absolute-time-ordered stream (mido's merged_track) —
lossy w.r.t. track boundaries, same as mido.
*/

import type { MidiData, MidiEvent, MidiHeader, MidiTrack } from "./MIDI";


interface FieldSpec {
	token: string;
	fields: string[];   // numeric field names, in order, after deltaTime
}

// channel + numeric-meta events: serialized as space-separated integers
const FIELD_SPECS: Record<string, FieldSpec> = {
	// channel events
	noteOff:           { token: "note_off",        fields: ["channel", "noteNumber", "velocity"] },
	noteOn:            { token: "note_on",          fields: ["channel", "noteNumber", "velocity"] },
	noteAftertouch:    { token: "polytouch",        fields: ["channel", "noteNumber", "amount"] },
	controller:        { token: "control_change",   fields: ["channel", "controllerType", "value"] },
	programChange:     { token: "program_change",   fields: ["channel", "programNumber"] },
	channelAftertouch: { token: "aftertouch",       fields: ["channel", "amount"] },
	pitchBend:         { token: "pitchwheel",       fields: ["channel", "value"] },
	// numeric meta events
	setTempo:          { token: "set_tempo",        fields: ["microsecondsPerBeat"] },
	timeSignature:     { token: "time_signature",   fields: ["numerator", "denominator", "metronome", "thirtyseconds"] },
	keySignature:      { token: "key_signature",    fields: ["key", "scale"] },
	sequenceNumber:    { token: "sequence_number",  fields: ["number"] },
	midiChannelPrefix: { token: "channel_prefix",   fields: ["channel"] },
	smpteOffset:       { token: "smpte_offset",     fields: ["frameRate", "hour", "min", "sec", "frame", "subframe"] },
	endOfTrack:        { token: "end_of_track",     fields: [] },
};

// meta events carrying a free `text` payload (rest of the line, escaped)
const TEXT_SPECS: Record<string, string> = {
	text:            "text",
	copyrightNotice: "copyright",
	trackName:       "track_name",
	instrumentName:  "instrument_name",
	lyrics:          "lyrics",
	marker:          "marker",
	cuePoint:        "cue_point",
};

// events carrying raw bytes in `data` (sysEx / unknown meta); emitted as hex
const DATA_SPECS: Record<string, { token: string; type: string }> = {
	sequencerSpecific: { token: "sequencer_specific", type: "meta" },
	unknown:           { token: "meta_unknown",       type: "meta" },
	sysEx:             { token: "sysex",              type: "sysEx" },
	dividedSysEx:      { token: "divided_sysex",      type: "dividedSysEx" },
};

// reverse lookups (token -> subtype) built once
const TOKEN_TO_SUBTYPE: Record<string, string> = {};
for (const [subtype, spec] of Object.entries(FIELD_SPECS))
	TOKEN_TO_SUBTYPE[spec.token] = subtype;
for (const [subtype, token] of Object.entries(TEXT_SPECS))
	TOKEN_TO_SUBTYPE[token] = subtype;
for (const [subtype, spec] of Object.entries(DATA_SPECS))
	TOKEN_TO_SUBTYPE[spec.token] = subtype;


const escapeText = (s: string): string => {
	let r = s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
	// guard leading/trailing spaces against line-trimming on decode (\s == literal space)
	r = r.replace(/^ +/, m => "\\s".repeat(m.length)).replace(/ +$/, m => "\\s".repeat(m.length));
	return r;
};

const UNESCAPE_MAP: Record<string, string> = { "\\": "\\", n: "\n", r: "\r", t: "\t", s: " " };
const unescapeText = (s: string): string =>
	s.replace(/\\([\\nrts])/g, (_, c) => UNESCAPE_MAP[c]);

const bytesToHex = (s: string): string =>
	Array.from(s, c => (c.charCodeAt(0) & 0xff).toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex: string): string => {
	let out = "";
	for (let i = 0; i + 1 < hex.length; i += 2)
		out += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return out;
};

// numeric values are hex (lower-case, no prefix); negatives keep a leading "-"
const numToHex = (n: number): string => {
	const v = Math.trunc(n);
	return v < 0 ? "-" + (-v).toString(16) : v.toString(16);
};

const hexToNum = (s: string): number => parseInt(s, 16);


// --- encode: one MidiEvent -> one text line -------------------------------

function eventToLine (event: MidiEvent): string | null {
	const delta = numToHex(event.deltaTime ?? 0);
	const sub = event.subtype;

	if (sub && FIELD_SPECS[sub]) {
		const spec = FIELD_SPECS[sub];
		const parts = [spec.token, delta];
		for (const f of spec.fields)
			parts.push(numToHex((event as any)[f] ?? 0));
		// note_off velocity is almost always 0 — drop the trailing 0 (decode restores it
		// via the `?? 0` fill, so this is lossless). Only when it is exactly 0.
		if (sub === "noteOff" && parts[parts.length - 1] === "0")
			parts.pop();
		return parts.join(" ");
	}

	if (sub && TEXT_SPECS[sub])
		return `${TEXT_SPECS[sub]} ${delta} ${escapeText(event.text ?? "")}`;

	if (sub && DATA_SPECS[sub])
		return `${DATA_SPECS[sub].token} ${delta} ${bytesToHex(event.data ?? "")}`;

	// bare sysEx without a meta subtype
	if (event.type === "sysEx")
		return `sysex ${delta} ${bytesToHex(event.data ?? "")}`;
	if (event.type === "dividedSysEx")
		return `divided_sysex ${delta} ${bytesToHex(event.data ?? "")}`;

	return null;   // unrepresentable event — skipped (caller may count)
}


// --- decode: one text line -> one MidiEvent -------------------------------

function lineToEvent (line: string): MidiEvent | null {
	const trimmed = line.trim();
	if (!trimmed)
		return null;

	const sp = trimmed.indexOf(" ");
	const token = sp < 0 ? trimmed : trimmed.slice(0, sp);
	const rest = sp < 0 ? "" : trimmed.slice(sp + 1);

	const subtype = TOKEN_TO_SUBTYPE[token];
	if (!subtype)
		throw new Error(`MidiText: unknown token "${token}"`);

	// deltaTime is always the first field after the token
	const sp2 = rest.indexOf(" ");
	const deltaStr = sp2 < 0 ? rest : rest.slice(0, sp2);
	const tail = sp2 < 0 ? "" : rest.slice(sp2 + 1);
	const deltaTime = hexToNum(deltaStr) || 0;

	if (FIELD_SPECS[subtype]) {
		const spec = FIELD_SPECS[subtype];
		const nums = tail.length ? tail.split(/\s+/).map(hexToNum) : [];
		const event: MidiEvent = {
			deltaTime,
			type: subtype === "setTempo" || subtype === "timeSignature" || subtype === "keySignature"
				|| subtype === "sequenceNumber" || subtype === "midiChannelPrefix"
				|| subtype === "smpteOffset" || subtype === "endOfTrack" ? "meta" : "channel",
			subtype,
		};
		spec.fields.forEach((f, i) => { (event as any)[f] = nums[i] ?? 0; });
		return event;
	}

	if (TEXT_SPECS[subtype])
		return { deltaTime, type: "meta", subtype, text: unescapeText(tail) };

	if (DATA_SPECS[subtype]) {
		const { type } = DATA_SPECS[subtype];
		const event: MidiEvent = { deltaTime, type, data: hexToBytes(tail) };
		if (type === "meta")
			event.subtype = subtype;
		return event;
	}

	return null;
}


// --- track merge (mido's merge_tracks): delta -> abs, stable sort, abs -> delta

function mergeTracks (tracks: MidiTrack[]): MidiTrack {
	const merged: { event: MidiEvent; tick: number; order: number }[] = [];
	let order = 0;
	for (const track of tracks) {
		let tick = 0;
		for (const event of track) {
			tick += event.deltaTime ?? 0;
			// drop per-track endOfTrack; a single one is re-appended after the merge
			if (event.subtype === "endOfTrack")
				continue;
			merged.push({ event, tick, order: order++ });
		}
	}
	// stable sort by absolute tick (ties keep original interleave order)
	merged.sort((a, b) => (a.tick - b.tick) || (a.order - b.order));

	const out: MidiTrack = [];
	let last = 0;
	for (const { event, tick } of merged) {
		out.push({ ...event, deltaTime: tick - last });
		last = tick;
	}
	out.push({ deltaTime: 0, type: "meta", subtype: "endOfTrack" });
	return out;
}


// Rescale a track's delta-times to a new ticks-per-beat. Works in ABSOLUTE ticks
// (delta→abs, scale by factor, round, abs→delta) so rounding error stays local to
// each event instead of accumulating across the track.
function rescaleTrack (track: MidiTrack, factor: number): MidiTrack {
	const out: MidiTrack = [];
	let absTick = 0;
	let lastScaled = 0;
	for (const event of track) {
		absTick += event.deltaTime ?? 0;
		const scaled = Math.round(absTick * factor);
		out.push({ ...event, deltaTime: scaled - lastScaled });
		lastScaled = scaled;
	}
	return out;
}


// --- public API -----------------------------------------------------------

interface MidiToTextOptions {
	mix?: boolean;          // merge all tracks into one absolute-time stream (mido merged_track)
	header?: boolean;       // emit ticks_per_beat/format_type header lines (default true)
	target_ticks_per_beat?: number;   // rescale all delta-times to this target ticks_per_beat (rounded)
}

/** Encode a parsed MidiData into mido-style text. */
function midiToText (midi: MidiData, options: MidiToTextOptions = {}): string {
	const { mix = false, header = true, target_ticks_per_beat } = options;
	const lines: string[] = [];

	// when a target tpb is requested, rescale delta-times from the source tpb to the target
	const srcTpb = midi.header.ticksPerBeat;
	const tgtTpb = target_ticks_per_beat;
	const doScale = !!tgtTpb && tgtTpb > 0 && srcTpb > 0 && tgtTpb !== srcTpb;
	const factor = doScale ? tgtTpb / srcTpb : 1;
	const outTpb = doScale ? tgtTpb : srcTpb;

	if (header) {
		lines.push(`ticks_per_beat ${numToHex(outTpb)}`);
		lines.push(`format_type ${numToHex(midi.header.formatType ?? 1)}`);
	}

	let tracks = mix ? [mergeTracks(midi.tracks)] : midi.tracks;
	if (doScale)
		tracks = tracks.map(t => rescaleTrack(t, factor));
	tracks.forEach((track, i) => {
		if (!mix)
			lines.push(`track ${numToHex(i)}`);
		for (const event of track) {
			const line = eventToLine(event);
			if (line !== null)
				lines.push(line);
		}
	});

	return lines.join("\n");
}

/** Decode mido-style text back into MidiData (inverse of midiToText). */
function textToMidi (text: string): MidiData {
	let ticksPerBeat = 480;
	let formatType = 1;
	const tracks: MidiTrack[] = [];
	let current: MidiTrack | null = null;

	for (const raw of text.split("\n")) {
		const line = raw.trim();
		if (!line)
			continue;

		const token = line.split(/\s+/, 1)[0];
		if (token === "ticks_per_beat") {
			const v = hexToNum(line.slice(token.length).trim());
			if (Number.isFinite(v))
				ticksPerBeat = v;
			continue;
		}
		if (token === "format_type") {
			const v = hexToNum(line.slice(token.length).trim());
			if (Number.isFinite(v))
				formatType = v;
			continue;
		}
		if (token === "track") {
			current = [];
			tracks.push(current);
			continue;
		}

		if (!current) {   // no explicit `track` marker (e.g. mixed dump) — start one
			current = [];
			tracks.push(current);
		}
		const event = lineToEvent(line);
		if (event)
			current.push(event);
	}

	// ensure each track ends with endOfTrack (the encoder needs it)
	for (const track of tracks) {
		if (!track.length || track[track.length - 1].subtype !== "endOfTrack")
			track.push({ deltaTime: 0, type: "meta", subtype: "endOfTrack" });
	}

	const header: MidiHeader = { formatType, ticksPerBeat, trackCount: tracks.length };
	return { header, tracks };
}


export {
	midiToText,
	textToMidi,
	mergeTracks,
	MidiToTextOptions,
};
