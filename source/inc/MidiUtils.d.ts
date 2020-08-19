
import {MidiData} from "./MIDI/midi";
import {Note, NotationEvent} from "./MusicNotation";



declare const sliceMidi: (midi: MidiData, startTick: number, endTick: number) => MidiData;


interface NotationToEncode {
	microsecondsPerBeat?: number;

	notes: Note[];
	events?: NotationEvent[];
}


type EncoderOptions = {startTime?: number, unclosedNoteDuration?: number};

declare const encodeToMIDIData: (notation: NotationToEncode, options?: EncoderOptions) => MidiData;
declare const encodeToMIDI: (notation: NotationToEncode, options?: EncoderOptions) => ArrayBuffer;



export {
	sliceMidi,
	encodeToMIDIData,
	encodeToMIDI,
};
