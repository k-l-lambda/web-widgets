
/// <reference path="./MIDI/midi.d.ts" />



export class MidiPlayer {
	isPlaying: boolean;
	progressTime: number;


	constructor (midiData: MidiData, options: {
		cacheSpan?: number,
		onMidi?: (event: object, timestamp: number) => void,
		onPlayFinish: () => void,
	});

	dispose ();

	get progressTicks (): number;
	set progressTicks (value: number);

	play (): Promise<void>;

	pause ();

	turnCursor (time: number);
}
