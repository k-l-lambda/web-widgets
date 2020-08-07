
interface MidiHeader {
	formatType: number;
	trackCount: number;
	ticksPerBeat: number;
}


interface MidiEvent {
	type: string;
	subtype: string;

	channel: number;

	text?: string;

	frameRate?: object;
	hour?: number;
	min?: number;
	sec?: number;
	frame?: number;
	subframe?: number;

	numerator?: number;
	denominator?: number;
	metronome?: number;
	thirtyseconds?: number;

	key?: number;
	scale?: number;

	data?: string;

	noteNumber?: number;
	velocity?: number;

	amount?: number;

	controllerType?: number;

	programNumber?: number;

	value?: number;
}


type MidiTrack = MidiEvent[];


interface MidiData {
	header: MidiHeader;
	tracks: MidiTrack[];
}



export {
	MidiHeader,
	MidiEvent,
	MidiData,
};
