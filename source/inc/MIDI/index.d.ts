
import "./midi.d.ts";



declare function parseMidiData(data: string | object): MidiData;
declare function encodeMidiFile(data: MidiData): string;



export {
	parseMidiData,
	encodeMidiFile,
};
