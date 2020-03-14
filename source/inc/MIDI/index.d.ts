
/// <reference path="./midi.d.ts" />



declare module MIDI {
	function parseMidiData(data: string | object): MidiData;
	function encodeMidiFile(data: MidiData): string;
}
