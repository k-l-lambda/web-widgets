
import { Notation } from "./MusicNotation.js";



export default class MidiPlayer {
	constructor (midiData) {
		const notations = Notation.parseMidi(midiData);
		this.events = notations.events;
		console.log("events:", this.events);
	}
};
