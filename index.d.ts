
/// <reference path="./source/inc/MIDI/index.d.ts" />
/// <reference path="./source/inc/MusicNotation.d.ts" />
/// <reference path="./source/inc/MidiPlayer.d.ts" />
/// <reference path="./source/inc/Matcher/index.d.ts" />

import * as MIDITypes from "./source/inc/MIDI/midi";

import * as MusicNotation from "./source/inc/MusicNotation";
import * as MidiPlayerTypes from "./source/inc/MidiPlayer";

import * as MatcherNode from "./source/inc/Matcher/node";
import * as MatcherNavigator from "./source/inc/Matcher/navigator";



declare module "@k-l-lambda/web-widgets" {
	export namespace MIDI {
		export type MidiHeader = MIDITypes.MidiHeader;
		export type MidiEvent = MIDITypes.MidiEvent;
		export type MidiData = MIDITypes.MidiData;

		export function parseMidiData(data: string | object): MidiData;
		export function encodeMidiFile(data: MidiData): ArrayBuffer;
	}


	export type Note = MusicNotation.Note;
	export type Tempo = MusicNotation.Tempo;
	export type Notation = MusicNotation.Notation;

	export type MidiPlayer = MidiPlayerTypes.MidiPlayer;


	export namespace Matcher {
		export type Node = MatcherNode.Node;
		export type Navigator = MatcherNavigator.Navigator;

		export function normalizeInterval(interval: number): number;
		export function makeNoteSoftIndex(notes: Note[], index: number);
		export function makeMatchNodes(note: Note, criterion: Notation, zeroNode?: object);
		export function genNotationContext(notation: Notation);
		export function runNavigation(criterion: Notation, sample: Notation, onStep?: (i: number, navigator: Navigator) => Symbol | Promise<Symbol>): Promise<Navigator>;
	} 
}
