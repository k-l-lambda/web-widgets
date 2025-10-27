import * as MIDI from "./MIDI";



type MidiEvent = any; // TODO
type MidiTrackEvent = { time?: number, ticks?: number, deltaTime?: number, tick?: number, type?: string, subtype?: string, [key: string]: any };
type MidiTrack = MidiTrackEvent[];

const trackDeltaToAbs = (events: MidiTrack) => {
	let tick = 0;

	events.forEach(event => {
		tick += event.deltaTime;
		event.tick = tick;
	});
};


const trackAbsToDelta = (events: MidiTrack) => {
	let lastTick = 0;

	events.sort((e1, e2) => e1.tick - e2.tick).forEach(event => {
		event.deltaTime = event.tick - lastTick;
		lastTick = event.tick;
	});
};


const sliceTrack = (track: MidiTrack, startTick: number, endTick: number) => {
	trackDeltaToAbs(track);

	const events: MidiTrack = [];
	const status: Record<string, MidiTrackEvent> = {};

	track.forEach(event => {
		if (event.tick >= startTick && event.tick <= endTick && event.subtype !== "endOfTrack")
			events.push({
				...event,
				tick: event.tick - startTick,
			});
		else if (event.tick < startTick) {
			switch (event.type) {
			case "meta":
				status[event.subtype] = event;

				break;
			}
		}
	});

	Object.values(status).forEach((event: MidiEvent) => events.push(Object.assign({}, event, { tick: 0 })));

	events.push({
		tick: endTick - startTick,
		type: "meta",
		subtype: "endOfTrack",
	});

	trackAbsToDelta(events);

	return events;
};


const sliceMidi = (midi: any, startTick: number, endTick: number) => ({
	header: midi.header,
	tracks: midi.tracks.map(track => sliceTrack(track, startTick, endTick)),
});


const TICKS_PER_BEATS = 480;

const EXCLUDE_MIDI_EVENT_SUBTYPES = [
	"endOfTrack", "trackName",
	"noteOn", "noteOff",
];


function encodeToMIDIData(notation: any, {startTime, unclosedNoteDuration = 30e+3}: any = {}) {
	notation.microsecondsPerBeat = notation.microsecondsPerBeat || 500000;

	const ticksPerBeat = TICKS_PER_BEATS;
	const msToTicks = ticksPerBeat * 1000 / notation.microsecondsPerBeat;

	const header = { formatType: 0, ticksPerBeat };
	const track: MidiTrack = [];

	if (!Number.isFinite(startTime)) {
		if (!notation.notes || !notation.notes[0])
			throw new Error("encodeToMidiData: no start time specificed");

		startTime = notation.notes[0].start;
	}

	track.push({ time: startTime, type: "meta", subtype: "copyrightNotice", text: `Composed by MusicWdigets. BUILT on ${new Date(Number(process.env.VUE_APP_BUILD_TIME)).toDateString()}` });

	const containsTempo = notation.events && notation.events.find((event: any) => event.subtype == "setTempo");
	if (!containsTempo) {
		track.push({ time: startTime, type: "meta", subtype: "timeSignature", numerator: 4, denominator: 4, thirtyseconds: 8 });
		track.push({ time: startTime, type: "meta", subtype: "setTempo", microsecondsPerBeat: notation.microsecondsPerBeat });
	}

	let endTime = startTime || 0;

	if (notation.notes) {
		for (const note of notation.notes) {
			track.push({
				time: note.start,
				type: "channel",
				subtype: "noteOn",
				channel: note.channel || 0,
				noteNumber: note.pitch,
				velocity: note.velocity,
				finger: note.finger,
			});

			endTime = Math.max(endTime, note.start);

			if (Number.isFinite(unclosedNoteDuration))
				note.duration = note.duration || unclosedNoteDuration;
			if (note.duration) {
				track.push({
					time: note.start + note.duration,
					type: "channel",
					subtype: "noteOff",
					channel: note.channel || 0,
					noteNumber: note.pitch,
					velocity: 0,
				});

				endTime = Math.max(endTime, note.start + note.duration);
			}
		}
	}

	if (notation.events) {
		const events = notation.notes
			? notation.events.filter((event: any) => !EXCLUDE_MIDI_EVENT_SUBTYPES.includes(event.data.subtype))
			: notation.events;
		for (const event of events) {
			const dataObj = Object.assign({}, event.data);
			track.push(Object.assign({ time: event.time }, dataObj));

			endTime = Math.max(endTime, event.time);
		}
	}

	track.push({ time: endTime + 100, type: "meta", subtype: "endOfTrack" });

	track.sort(function (e1, e2) { return e1.time - e2.time; });

	// append finger event after every noteOn event
	track.map((event: MidiEvent, index: number) => ({event, index}))
		.filter(({event}: any) => event.subtype == "noteOn" && event.finger != null)
		.reverse()
		.forEach(({event, index}) => track.splice(index + 1, 0, {
			time: event.time,
			type: "meta",
			subtype: "text",
			text: `fingering(${event.finger})`,
		}));

	track.forEach((event: MidiEvent) => event.ticks = Math.round((event.time - startTime) * msToTicks));
	track.forEach((event: MidiEvent, i: number) => event.deltaTime = (event.ticks - (i > 0 ? (track[i - 1] as any).ticks : 0)));

	return {header, tracks: [track]};
};


function encodeToMIDI(notation: any, options: any) {
	const data = encodeToMIDIData(notation, options);
	return MIDI.encodeMidiFile(data);
};



module.exports = {
	sliceMidi,
	encodeToMIDIData,
	encodeToMIDI,
};
