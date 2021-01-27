
const Config = require("./config.js");
const Node = require("./node.js");



class Navigator {
	constructor (criterion, sample, options = {}) {
		this.criterion = criterion;
		this.sample = sample;

		this.getCursorOffset = options.getCursorOffset || (() => null);
		this.outOfPage = options.outOfPage;

		this.bestNode = null;
		this.fineCursor = null;

		this.breakingSI = sample.notes.length - 1;

		this.zeroNode = Node.zero();
		this.zeroNode.offset = this.getCursorOffset() || 0;
	}


	step (index) {
		//console.log("step:", this.zeroNode.offset);
		const note = this.sample.notes[index];

		if (note.matches.length > 0) {
			//console.log("zeroNode.offset:", index, this.zeroNode.offset);
			note.matches.forEach(node => {
				node.evaluatePrev(this.zeroNode);
				//console.log("node:", node, node.evaluatePrevCost(this.zeroNode), node.offset, this.zeroNode.offset);

				for (let si = index - 1; si >= Math.max(this.breakingSI + 1, index - Config.SkipDeep); --si) {
					//const skipCost = Config.SkipCost * (index - 1 - si);

					const prevNote = this.sample.notes[si];
					console.assert(prevNote, "prevNote is null:", si, index, this.sample.notes);
					prevNote.matches.forEach(prevNode => {
						const bias = node.offset - prevNode.offset;
						if (/*prevNode.totalCost + skipCost < node.totalCost
							&&*/ (bias < 2 / Config.LagOffsetCost && bias > -2 / Config.LeadOffsetCost))
							node.evaluatePrev(prevNode);
					});
				}

				node.prior = node.totalCost > 1.99 ? -1 : node.priorByOffset(this.zeroNode.offset);

				if (node.prior > 0 && this.outOfPage) {
					const tick = this.criterion.notes[node.ci].startTick;
					if (this.outOfPage(tick))
						node.prior -= 0.7;
				}
			});

			note.matches.sort((c1, c2) => c2.prior - c1.prior);
			this.cursors = note.matches;
			//console.log("navigator cursors:", this.cursors);

			let fineCursor = null;
			const nullLength = this.nullSteps(index);

			const cursor = this.cursors[0];
			if (cursor && cursor.totalCost < 1) {
				//console.log("nullLength:", nullLength, nullLength * Math.log(cursor.value / 4));
				if (cursor.prior > 0 || (cursor.totalCost < 0.4 && Math.log(Math.max(nullLength * cursor.value, 1e-3)) > Config.RelocationThreshold)) {
					this.zeroNode.offset = cursor.offset;

					fineCursor = cursor;

					if (!this.bestNode || cursor.value > this.bestNode.value)
						this.bestNode = cursor;
				}
			}

			if (fineCursor)
				this.fineCursor = fineCursor;
			else {
				if(!this.resetCursor(index)) {
					this.zeroNode.offset += note.deltaSi * Math.tanh(nullLength);
					console.assert(!Number.isNaN(this.zeroNode.offset), "zeroNode.offset is NaN.", note.deltaSi, nullLength);
				}
			}
		}
		else
			this.cursors = [];
	}


	path ({fromIndex = 0, toIndex = this.sample.notes.length - 1} = {}) {
		const path = [];

		let offset = null;

		for (let si = toIndex; si >= fromIndex;) {
			const note = this.sample.notes[si];

			if (!note.matches.length || note.matches[0].prior < -0.01 || note.matches[0].totalCost >= 1) {
				//if (note.matches.length)
				//	console.log("path -1:", si, note.matches[0].prior, note.matches[0].totalCost);
				path[si] = -1;
				--si;
				continue;
			}

			// sort nodes by backwards heuristic offset
			if (offset != null) {
				note.matches.forEach(node => node.backPrior = (node.totalCost < 1.99 ? node.priorByOffset(offset) : -1));
				note.matches.sort((n1, n2) => n2.backPrior - n1.backPrior);
			}

			const node = note.matches[0];
			node.path.forEach((ci, si) => path[si] = ci);
			//console.log("node path:", si, node.path);

			offset = node.root.offset;

			si = node.rootSi - 1;
		}

		console.assert(path.length == toIndex + 1, "path length error:", path, fromIndex, toIndex + 1,
			this.sample.notes.length, this.sample.notes.length ? this.sample.notes[this.sample.notes.length - 1].index : null);

		return path;
	}


	nullSteps (index) {
		return index - (this.fineCursor ? this.fineCursor.si : -1) - 1;
	}


	resetCursor (index) {
		this.breakingSI = index;

		const cursorOffset = this.getCursorOffset();
		if (cursorOffset != null) {
			//console.log("cursorOffset:", cursorOffset);

			this.zeroNode.offset = cursorOffset;
			//this.breaking = this.nullSteps(index) > Config.SkipDeep;
			//if (this.breaking)	// trivial zero node si resets result in focus path interruption
			this.zeroNode.si = index;
			this.fineCursor = null;

			console.assert(!Number.isNaN(this.zeroNode.offset), "zeroNode.offset is NaN.", cursorOffset);
			//console.log("cursor offset reset:", cursorOffset);

			return true;
		}

		return false;
	}


	get relocationTendency () {
		const cursor = this.cursors && this.cursors[0];
		if (!cursor)
			return null;

		const nullLength = this.nullSteps(cursor.si);
		if (nullLength <= 0)
			return 0;

		return Math.log(Math.max(nullLength * cursor.value, 1e-3)) / Config.RelocationThreshold;
	}
};



module.exports = Navigator;
