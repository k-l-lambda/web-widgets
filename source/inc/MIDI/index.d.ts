
/// <reference path="./midi.d.ts" />



declare module MIDI {
	export function parseMidiData(data: string | object): MidiData;
	export function encodeMidiFile(data: MidiData): string;
}
