
/// <reference path="./MIDI/midi.d.ts" />



export interface Note {
	start: number;
	duration: number;
	startTick: number;
	pitch: number;
	velocity?: number;

	index?: number;
	deltaSi?: number;
	softIndex?: number;
}


export interface Tempo {
	tempo: number;
	tick: number;
	time: number;
}


export interface NotationData {
	ticksPerBeat?: number;

	notes: Note[];
	tempos?: Tempo[];

	endTime?: number;
	endTick?: number;

	pitchMap?: {[key: number]: Note[]};
}


export class Notation implements NotationData {
	static parseMidi(data: MidiData): Notation;

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
