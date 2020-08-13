
import {MidiEvent, MidiData} from "./MIDI";



interface MIDISequenceEvent {
	event: MidiEvent;
	ticksToEvent: number;
	track: number;
}


type MIDISequence = [MIDISequenceEvent, number][];


declare const midiToSequence: (midi: MidiData, options?: {timeWarp?: number}) => MIDISequence;


declare const trimSequence: (seq: MIDISequence) => MIDISequence;
declare const fixOverlapNotes: (seq: MIDISequence) => MIDISequence;



export {
	midiToSequence,
	trimSequence,
	fixOverlapNotes,
};
