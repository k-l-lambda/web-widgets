
/// <reference path="./MIDI/midi.d.ts" />



export interface MidiPlayer {
	isPlaying: boolean;
	progressTime: number;
	progressTicks: number;


	constructor (midiData: MidiData, options: {
		cacheSpan?: number,
		onMidi?: (event: object, timestamp: number) => void,
		onPlayFinish: () => void,
	});

	dispose ();

	play (): Promise<void>;

	pause ();

	turnCursor (time: number);
}
