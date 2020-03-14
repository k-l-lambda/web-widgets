
/// <reference path="./MIDI/midi.d.ts" />



interface Note {
	start: number;
	duration: number;
	startTick: number;
	pitch: number;
	velocity?: number;
}


declare class Notation {
	static parseMidi(data: MidiData): Notation;

	constructor (fields: object);

	findChordBySoftindex(softIndex: number, radius?: number): Note[];

	averageTempo(tickRange: {from: number, to: number}): number;

	ticksToTime(ticks: number): number;

	tickRangeToTimeRange(tickRange: {from: number, to: number}): object;

	getMeasureRange(measureRange: {start: number, end: number}): {
		tickRange: object,
		timeRange: object,
	};
}
