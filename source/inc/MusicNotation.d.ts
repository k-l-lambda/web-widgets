
import {MidiData, MidiEvent} from "./MIDI/midi";
import Node from "./Matcher/node";




interface Note {
	channel: number;
	start: number;
	duration: number;
	startTick: number;
	pitch: number;
	velocity?: number;

	index?: number;
	deltaSi?: number;
	softIndex?: number;

	matches?: Node[];

	id?: string;
	ids?: string[];
}


interface Tempo {
	tempo: number;
	tick: number;
	time: number;
}


interface NotationEvent {
	data: MidiEvent;
	track?: number;
	deltaTime?: number;
	deltaTicks?: number;
	time?: number;
	ticks?: number;
}


interface NotationData {
	ticksPerBeat?: number;

	notes: Note[];
	events?: NotationEvent[];
	tempos?: Tempo[];

	endTime?: number;
	endTick?: number;

	pitchMap?: {[key: number]: Note[]};
}


declare class Notation implements NotationData {
	static parseMidi(data: MidiData, options?: {fixOverlap?: boolean}): Notation;

	ticksPerBeat: number;

	notes: Note[];
	tempos: Tempo[];

	endTime: number;
	endTick: number;

	pitchMap?: {[key: number]: Note[]};

	constructor (fields: object);

	findChordBySoftindex (softIndex: number, radius?: number): Note[];

	averageTempo (tickRange: {from: number, to: number}): number;

	ticksToTime (ticks: number): number;
	timeToTicks (time: number): number;

	tickRangeToTimeRange (tickRange: {from: number, to: number}): object;

	getMeasureRange (measureRange: {start: number, end: number}): {
		tickRange: object,
		timeRange: object,
	}
}


declare const midiToEvents: (midi: MidiData, timeWarp?: number) => any;



export {
	NotationData,
	Note,
	NotationEvent,
	Notation,
	midiToEvents,
};
