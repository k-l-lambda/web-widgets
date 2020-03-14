
/// <reference path="./MIDI/midi.d.ts" />



declare class MidiPlayer {
	isPlaying: boolean;
	progressTime: number;


	constructor (midiData: MidiData, options: {
		cacheSpan?: number,
		onMidi?: (event: object, timestamp: number) => void,
		onPlayFinish: () => void,
	});

	dispose ();

	play () : Promise<void>;

	pause ();

	turnCursor (time: number);
}
