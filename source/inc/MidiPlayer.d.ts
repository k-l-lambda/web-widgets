
import {MidiData} from "./MIDI/midi";
import {Notation} from "./MusicNotation";



declare class MidiPlayer {
	isPlaying: boolean;
	progressTime: number;
	progressTicks: number;


	constructor (midiData: MidiData | Notation, options: {
		cacheSpan?: number,
		onMidi?: (event: object, timestamp: number) => void,
		onPlayFinish?: () => void,
	});

	dispose ();

	play (options?: {nextFrame: () => Promise<void>}): Promise<void>;

	pause ();

	turnCursor (time: number);
}



export default MidiPlayer;
