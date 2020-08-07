
import fs from "fs";

import MIDI from "../../source/inc/MIDI";
import * as MusicNotation from "../../source/inc/MusicNotation";



const main = filepath => {
	//console.log("main:", filepath);
	const buffer = fs.readFileSync(filepath);
	const midi = MIDI.parseMidiData(buffer);
	//console.log("midi:", midi);

	const events = MusicNotation.midiToEvents(midi);
	console.log("events:", events);

	//const notation = MusicNotation.Notation.parseMidi(midi);
	//console.log("notation:", notation);
};



const argv = JSON.parse(process.env.npm_config_argv);

main(argv.original[2]);



// keep inspector connected
setTimeout(() => console.log("done."), 1e+8);
