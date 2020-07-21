
import {MidiData} from "./MIDI/midi";
import {Note, NotationEvent} from "./MusicNotation";



declare const sliceMidi: (midi: MidiData, startTick: number, endTick: number) => MidiData;


interface NotationToEncode {
	microsecondsPerBeat?: number;

	notes: Note[];
	events: NotationEvent[];
};


declare const encodeToMIDIData: (notation: NotationToEncode, options: {startTime: number, unclosedNoteDuration?: number}) => MidiData;
declare const encodeToMIDI: (notation: NotationToEncode, startTime: number) => ArrayBuffer;



export {
	sliceMidi,
	encodeToMIDIData,
	encodeToMIDI,
};
