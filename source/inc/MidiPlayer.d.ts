
import "./MIDI/midi.d.ts";



declare class MidiPlayer {
	isPlaying: boolean;
	progressTime: number;


	constructor (midiData: MidiData, options: {
		cacheSpan?: number,
		onMidi?: (event: object, timestamp: number) => void,
		onPlayFinish: () => void,
	});

	dispose ();

	async play ();

	pause ();

	turnCursor (time: number);
};



export default MidiPlayer;
