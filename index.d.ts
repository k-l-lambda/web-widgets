
/// <reference path="./source/inc/MIDI/index.d.ts" />
/// <reference path="./source/inc/MidiPlayer.d.ts" />

import * as MIDITypes from "./source/inc/MIDI/midi";

import * as MidiPlayerTypes from "./source/inc/MidiPlayer";



declare module "@k-l-lambda/web-widgets" {
	export namespace MIDI {
		export type MidiHeader = MIDITypes.MidiHeader;
		export type MidiEvent = MIDITypes.MidiEvent;
		export type MidiData = MIDITypes.MidiData;

		export function parseMidiData(data: string | object): MidiData;
		export function encodeMidiFile(data: MidiData): ArrayBuffer;
	}


	export namespace MusicNotation {
		export interface Note {
			start: number;
			duration: number;
			startTick: number;
			pitch: number;
			velocity?: number;
		
			index?: number;
			deltaSi?: number;
			softIndex?: number;

			matches?: Node[];
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
	}


	export type MidiPlayer = MidiPlayerTypes.MidiPlayer;


	export namespace Matcher {
		//export type Node = Matcher.Node;
		//export type Navigator = Matcher.Navigator;
		export interface Node {
			s_note: Note;
			c_note: Note;
		
		
			constructor (s_note: Note, c_note: Note);
		
			prev: Node;
			si: number;
			ci: number;
			offset: number;
			root: Node;
			rootSi: number;
			id: string;
			totalCost: number;
			value: number;
			deep: number;
			path: number[];
			prior?: number;
		
			evaluatePrev (node: Node): boolean;
			evaluatePrevCost (node: Node): number;
			priorByOffset (offset: number): number;
		
		
			cost (prev: number, skip: number, self: number): number;
			zero (): object;
		}


		export class Navigator {
			zeroNode: any;
			cursors: Node[];
			fineCursor?: Node;
		
		
			constructor (criterion: Notation, sample: NotationData, options: {
				getCursorOffset: () => number,
				outOfPage: (tick: number) => boolean,
			});
		
			step (index: number);
		
			path (options?: {fromIndex?: number, toIndex?: number}): number[];
		
			nullSteps(index: number): number;
		
			resetCursor(index: number): boolean;
		
			relocationTendency: number;
		}


		export function normalizeInterval(interval: number): number;
		export function makeNoteSoftIndex(notes: Note[], index: number);
		export function makeMatchNodes(note: Note, criterion: NotationData, zeroNode?: object);
		export function genNotationContext(notation: NotationData);
		export function runNavigation(criterion: NotationData, sample: NotationData, onStep?: (i: number, navigator: Navigator) => Symbol | Promise<Symbol>): Promise<Navigator>;
	}
}
