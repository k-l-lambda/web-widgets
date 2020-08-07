
import {MidiEvent, MidiData} from "./MIDI";



interface MIDISequenceEvent {
	event: MidiEvent;
	ticksToEvent: number;
	track: number;
}


type MIDISequence = [MIDISequenceEvent, number][];


declare const midiToSequence: (midi: MidiData, timeWarp?: number) => MIDISequence;



export {
	midiToSequence,
};
