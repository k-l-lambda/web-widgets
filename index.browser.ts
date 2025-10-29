// Use compiled outputs from lib (built by tsc)
import * as MIDI from "./source/inc/MIDI";
import * as MusicNotation from "./source/inc/MusicNotation";
import MidiPlayer from "./source/inc/MidiPlayer";
import * as Matcher from "./source/inc/Matcher";
import MidiAudio from "./source/MidiAudio";
import * as MidiUtils from "./source/inc/MidiUtils";
import MidiRoll from "./source/views/midi-roll.vue";
import SvgPianoRoll from "./source/components/svg-piano-roll.vue";



export {
	MIDI,
	MusicNotation,
	MidiPlayer,
	Matcher,
	MidiAudio,
	MidiUtils,
	MidiRoll,
	SvgPianoRoll,
};
