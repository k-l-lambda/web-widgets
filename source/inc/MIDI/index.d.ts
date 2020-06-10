
import {MidiHeader, MidiEvent, MidiData} from "./midi";



declare const parseMidiData: (data: string | object) => MidiData;
declare const encodeMidiFile: (data: MidiData) => ArrayBuffer;



export {
	MidiHeader,
	MidiEvent,
	MidiData,
	parseMidiData,
	encodeMidiFile,
};
