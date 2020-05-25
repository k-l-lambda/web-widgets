
/// <reference path="./source/inc/MIDI/index.d.ts" />
/// <reference path="./source/inc/MusicNotation.d.ts" />
/// <reference path="./source/inc/MidiPlayer.d.ts" />

import * as MIDITypes from "./source/inc/MIDI/midi";

//import * as MusicNotation from "./source/inc/MusicNotation";
import * as MidiPlayerTypes from "./source/inc/MidiPlayer";

//import * as MatcherNode from "./source/inc/Matcher/node";
//import * as MatcherNavigator from "./source/inc/Matcher/navigator";
//import * as Matcher from "./source/inc/Matcher";



declare module "@k-l-lambda/web-widgets" {
	export namespace MIDI {
		export type MidiHeader = MIDITypes.MidiHeader;
		export type MidiEvent = MIDITypes.MidiEvent;
		export type MidiData = MIDITypes.MidiData;

		export function parseMidiData(data: string | object): MidiData;
		export function encodeMidiFile(data: MidiData): ArrayBuffer;
	}


	// TODO: not working like this
	//export type Note = MusicNotation.Note;
	//export type Tempo = MusicNotation.Tempo;
	//export type NotationData = MusicNotation.NotationData;
	//export type Notation = MusicNotation.Notation;
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
