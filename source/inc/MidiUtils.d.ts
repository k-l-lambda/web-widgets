
import {MidiData} from "./MIDI/midi";



declare const sliceMidi: (midi: MidiData, startTick: number, endTick: number) => MidiData;



export {
	sliceMidi,
};
