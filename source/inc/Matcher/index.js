
const Node = require("./node.js");
const Navigator = require("./navigator.js");



const HEART_BEAT = 800;	// in ms
const SIMULTANEOUS_INTERVAL = HEART_BEAT * 0.24;


const normalizeInterval = interval => Math.tanh(interval / SIMULTANEOUS_INTERVAL);


const makeNoteSoftIndex = function (notes, index) {
	index = Number(index);

	const note = notes[index];

	// make soft index
	if (index > 0) {
		const lastNote = notes[index - 1];

		console.assert(note.start != null, "note.start is null", note);
		console.assert(lastNote.start != null, "lastNote.start is null", lastNote);

		note.deltaSi = normalizeInterval(note.start - lastNote.start);
		note.softIndex = lastNote.softIndex + note.deltaSi;

		console.assert(!Number.isNaN(note.deltaSi), "note.deltaSi is NaN.", note.start, lastNote.start);
	}
	else {
		note.softIndex = 0;
		note.deltaSi = 0;
	}
};


const makeMatchNodes = function (note, criterion, zeroNode = Node.zero()) {
	note.matches = [];

	const targetList = criterion.pitchMap[note.pitch];
	if (targetList) {
		for (const targetNote of targetList) {
			const node = new Node(note, targetNote);
			if (zeroNode)
				node.evaluatePrev(zeroNode);

			note.matches.push(node);
		}
	}
};


const genNotationContext = function (notation) {
	for (let i = 0; i < notation.notes.length; ++i)
		makeNoteSoftIndex(notation.notes, i);
};


const runNavigation = async function(criterion, sample, onStep) {
	const navigator = new Navigator(criterion, sample);

	for (let i = 0; i < sample.notes.length; ++i) {
		navigator.step(i);

		const next = onStep && onStep(i, navigator);
		if (next == Symbol.for("end")) {
			console.log("Navigation interrupted.");

			return;
		}
		else if (next) {
			const command = await next;
			if (command == Symbol.for("end")) {
				console.log("Navigation interrupted.");

				return;
			}
		}
	}

	//console.log("Navigation accomplished.");

	return navigator;
};



module.exports = {
	normalizeInterval,
	makeNoteSoftIndex,
	makeMatchNodes,
	genNotationContext,
	runNavigation,
	Navigator,
	Node,
};
