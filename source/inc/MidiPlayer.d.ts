
import {MidiData} from "./MIDI/midi";
import {NotationData} from "./MusicNotation";



declare class MidiPlayer {
	isPlaying: boolean;
	progressTime: number;
	progressTicks: number;


	constructor (midiData: MidiData | NotationData, options: {
		cacheSpan?: number,
		onMidi?: (event: object, timestamp: number) => void,
		onPlayFinish: () => void,
	});

	dispose ();

	play (): Promise<void>;

	pause ();

	turnCursor (time: number);
}



export default MidiPlayer;
