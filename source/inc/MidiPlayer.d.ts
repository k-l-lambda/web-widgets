
import {MidiData, MidiEvent} from "./MIDI/midi";
import {Notation} from "./MusicNotation";



declare class MidiPlayer {
	isPlaying: boolean;
	progressTime: number;
	progressTicks: number;


	constructor (midiData: MidiData | Notation, options: {
		cacheSpan?: number,
		onMidi?: (event: MidiEvent, timestamp: number) => void,
		onPlayFinish?: () => void,
		onTurnCursor?: (progressTime: number) => void,
	});

	dispose ();

	play (options?: {nextFrame: () => Promise<void>}): Promise<void>;

	pause ();

	turnCursor (time: number);
}



export default MidiPlayer;
