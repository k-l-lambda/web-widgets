
import MatchNode from "./node";
import Navigator from "./navigator";

import {Note, Notation} from "./types";



const HEART_BEAT = 800;	// in ms
const SIMULTANEOUS_INTERVAL = HEART_BEAT * 0.24;


const normalizeInterval = (interval: number): number => Math.tanh(interval / SIMULTANEOUS_INTERVAL);


// greater softIndexFactor make 'harder' soft index
const makeNoteSoftIndex = function (notes: Note[], index: number, {softIndexFactor = 1} = {}): void {
	index = Number(index);

	const note = notes[index];

	// make soft index
	if (index > 0) {
		const lastNote = notes[index - 1];

		console.assert(note.start != null, "note.start is null", note);
		console.assert(lastNote.start != null, "lastNote.start is null", lastNote);

		note.deltaSi = normalizeInterval((note.start - lastNote.start) * softIndexFactor);
		note.softIndex = lastNote.softIndex + note.deltaSi;

		console.assert(!Number.isNaN(note.deltaSi), "note.deltaSi is NaN.", note.start, lastNote.start);
	}
	else {
		note.softIndex = 0;
		note.deltaSi = 0;
	}
};


const makeMatchNodes = function (note: Note, criterion: Notation, zeroNode = MatchNode.zero()): void {
	note.matches = [];

	const targetList = criterion.pitchMap[note.pitch];
	if (targetList) {
		for (const targetNote of targetList) {
			const node = new MatchNode(note, targetNote);
			if (zeroNode)
				node.evaluatePrev(zeroNode);

			note.matches.push(node);
		}
	}
};


const genNotationContext = function (notation: Notation, {softIndexFactor = 1} = {}): void {
	for (let i = 0; i < notation.notes.length; ++i)
		makeNoteSoftIndex(notation.notes, i, {softIndexFactor});
};


const runNavigation = async function(criterion: Notation, sample: Notation, onStep: ((index: number, navigator: Navigator) => any) | null = null): Promise<Navigator | void> {
	const navigator = new Navigator(criterion, sample);
	navigator.resetCursor(-1);

	for (let i = 0; i < sample.notes.length; ++i) {
		navigator.step(i);

		const next = await (onStep && onStep(i, navigator));
		if (next === Symbol.for("end")) {
			console.log("Navigation interrupted.");

			return;
		}
	}

	return navigator;
};



export * from "./types";

export {
	normalizeInterval,
	makeNoteSoftIndex,
	makeMatchNodes,
	genNotationContext,
	runNavigation,
	Navigator,
	MatchNode,
};
