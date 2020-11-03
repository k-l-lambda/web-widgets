
import {MidiData, MidiEvent} from "./MIDI/midi";
import Node from "./Matcher/node";




interface Note {
	channel: number;
	start: number;
	duration: number;
	startTick: number;
	endTick: number;
	pitch: number;
	velocity?: number;
	beats?: number;
	track?: number;
	finger?: number;

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


interface BeatInfo {
	beatIndex?: number;
	beatsUnit: number,
	beats: number,
	tick: number,
}


interface NotationMetaInfo {
	beatInfos?: BeatInfo[];

	[key: string]: any;
}


interface NotationData {
	ticksPerBeat?: number;

	notes: Note[];
	channels?: Note[][];
	events?: NotationEvent[];
	tempos?: Tempo[];

	endTime?: number;
	endTick?: number;

	pitchMap?: {[key: number]: Note[]};

	meta?: NotationMetaInfo;
}


interface FromToRange {
	from: number;
	to: number;
}


interface Pedal {
	type: string;
	start: number;
	duration: number;
	value: number;
}


interface Bar {
	time: number;
	index: number;
}


interface NotationProtoData {
	channels: Note[][];
	meta: NotationMetaInfo;

	keyRange?: {low: number, high: number};
	pedals?: Pedal[];
	bars?: Bar[];
	endTime?: number;
	endTick?: number;
	correspondences?: number[];
	events?: NotationEvent[];
	tempos: Tempo[];
	ticksPerBeat?: number;
	measures?: any;
}


declare class Notation implements NotationProtoData {
	static parseMidi(data: MidiData, options?: {fixOverlap?: boolean}): Notation;

	ticksPerBeat: number;

	channels: Note[][];
	notes: Note[];
	events?: NotationEvent[];
	tempos: Tempo[];

	endTime: number;
	endTick: number;

	duration: number;
	pitchMap: {[key: number]: Note[]};

	keyRange?: {low: number, high: number};
	pedals?: Pedal[];
	bars?: Bar[];

	meta: NotationMetaInfo;

	constructor (fields: NotationProtoData);

	findChordBySoftindex (softIndex: number, radius?: number): Note[];

	averageTempo (tickRange: FromToRange): number;

	ticksToTime (ticks: number): number;
	timeToTicks (time: number): number;

	tickRangeToTimeRange (tickRange: FromToRange): FromToRange;

	getMeasureRange (measureRange: {start: number, end: number}): {
		tickRange: object,
		timeRange: object,
	};
}


declare const midiToEvents: (midi: MidiData, timeWarp?: number) => any;



export {
	NotationData,
	Note,
	NotationEvent,
	Notation,
	midiToEvents,
};
