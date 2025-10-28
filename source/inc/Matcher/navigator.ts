
import MatchNode from "./node";
import Config from "./config";

import { Notation } from "./types";



class Navigator {
	criterion: Notation;
	sample: Notation;
	zeroNode: any;
	cursors: any[];
	bestNode: any;
	fineCursor: any;
	breakingSI: number;
	relocationThreshold: number;


	constructor (criterion: Notation, sample: Notation, {relocationThreshold = Config.RelocationThreshold} = {}) {
		this.criterion = criterion;
		this.sample = sample;
		this.zeroNode = MatchNode.zero();
		this.cursors = [];
		this.bestNode = null;
		this.fineCursor = null;
		this.breakingSI = -1;
		this.relocationThreshold = relocationThreshold;
	}

	getCursorOffset (): number {
		return this.zeroNode.offset;
	}

	step (index: number): void {
		const note = this.sample.notes[index];

		if (note.matches && note.matches.length) {
			let fineCursor = null;
			const nullLength = this.nullSteps(index);

			const cursor = this.cursors[0];
			if (cursor && cursor.totalCost < 1) {
				if (cursor.prior > 0 || (cursor.totalCost < 0.4 && Math.log(Math.max(nullLength * cursor.value, 1e-3)) > this.relocationThreshold)) {
					this.zeroNode.offset = cursor.offset;
					fineCursor = cursor;
					if (!this.bestNode || cursor.value > this.bestNode.value)
						this.bestNode = cursor;
				}
			}

			if (fineCursor)
				this.fineCursor = fineCursor;
			else {
				if (!this.resetCursor(index, {breaking: false})) {
					this.zeroNode.offset += note.deltaSi * Math.tanh(nullLength);
				}
			}
		}
		else
			this.cursors = [];
	}


	path ({fromIndex = 0, toIndex = this.sample.notes.length - 1} = {}): number[] {
		const path: number[] = [];

		let offset = null;

		for (let si = toIndex; si >= fromIndex;) {
			const note = this.sample.notes[si];

			if (!note.matches.length || note.matches[0].prior < -0.01 || note.matches[0].totalCost >= 1) {
				path[si] = -1;
				--si;
				continue;
			}

			if (offset != null) {
				note.matches.forEach(node => node.backPrior = (node.totalCost < 1.99 ? node.priorByOffset(offset) : -1));
				note.matches.sort((n1, n2) => n2.backPrior - n1.backPrior);
			}

			const node = note.matches[0];
			node.path.forEach((ci, si) => path[si] = ci);

			offset = node.root.offset;

			si = node.rootSi - 1;
		}

		return path;
	}


	nullSteps (index: number): number {
		return index - (this.fineCursor ? this.fineCursor.si : -1) - 1;
	}


	resetCursor (index: number, {breaking = true} = {}): boolean {
		if (breaking)
			this.breakingSI = index;

		const cursorOffset = this.getCursorOffset();
		if (cursorOffset != null) {
			this.zeroNode.offset = cursorOffset;
			this.zeroNode.si = index;
			this.fineCursor = null;

			return true;
		}

		return false;
	}


	get relocationTendency (): number | null {
		const cursor = this.cursors && this.cursors[0];
		if (!cursor)
			return null;

		const nullLength = this.nullSteps(cursor.si);
		if (nullLength <= 0)
			return 0;

		return Math.log(Math.max(nullLength * cursor.value, 1e-3)) / this.relocationThreshold;
	}
}



export default Navigator;
