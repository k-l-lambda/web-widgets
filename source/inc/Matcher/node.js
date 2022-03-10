
const {pick} = require("lodash");

const Config = require("./config.js");



class Node {
	constructor (s_note, c_note) {
		this.s_note = s_note;
		this.c_note = c_note;

		console.assert(this.s_note.softIndex != null, "s_note softIndex is null");
		this.offset = this.s_note.softIndex - this.c_note.softIndex;

		this._prev = null;
		this._totalCost = 0;
		this._value = 0;
		this.cacheDirty = true;

		//this.evaluatePrev(Node.Zero);
	}


	get prev () {
		return this._prev;
	}


	set prev (value) {
		if (value != this._prev) {
			this._prev = value;
			this.cacheDirty = true;
		}
	}


	get si () {
		return this.s_note.index;
	}


	get ci () {
		return this.c_note.index;
	}


	get root () {
		return this.prev.root || this;
	}


	get rootSi () {
		return !this.prev.zero ? this.prev.rootSi : this.si;
	}


	get id () {
		return `${this.s_note.index},${this.c_note.index}`;
	}


	static cost (prev, skip, self) {
		return prev * Config.CostStepAttenuation + Math.tanh(skip * Config.SkipCost) + Math.tanh(self * 0.5);
	}


	updateCache () {
		if (this.cacheDirty) {
			this._totalCost = Node.cost(this.prev.totalCost, this.si - this.prev.si - 1, this.selfCost);
			this._value = this.prev.value + 1 - Math.tanh(this.selfCost * 0.5);

			this.cacheDirty = false;
		}
	}


	get totalCost () {
		this.updateCache();

		return this._totalCost;
	}


	get value () {
		this.updateCache();

		return this._value;
	}


	get deep () {
		return this.prev.deep + 1;
	}


	get path () {
		const path = [];
		for (let node = this; !node.zero; node = node.prev) {
			path[node.si] = node.ci;
		}

		for (let i = 0; i < path.length; ++i)
			if (typeof path[i] != "number")
				path[i] = -1;

		return path;
	}


	dump () {
		return pick(this, ["id", "si", "ci", "rootSi", "value", "deep", "rootSi", "offset", "prior", "selfCost", "totalCost"]);
	}


	evaluatePrev (node) {
		const cost = this.evaluatePrevCost(node);

		console.assert(this.si - node.si >= 1, "node index error:", this, node/*, {get [Symbol.toStringTag]() {debugger}}*/);
		//if (this.si - node.si < 1)
		//	debugger;

		const totalCost = Node.cost(node.totalCost, this.si - node.si - 1, cost);

		if (!this.prev || totalCost < this.totalCost) {
			this.prev = node;
			this.selfCost = cost;

			return true;
		}

		return false;
	}


	evaluatePrevCost (node) {
		let cost = 0;

		if (node.offset != null) {
			const bias = this.offset - node.offset;
			const costCoeff = node.zero ? Config.ZeroOffsetCost : (bias > 0 ? Config.LagOffsetCost : Config.LeadOffsetCost);
			cost += (bias * costCoeff) ** 2;
		}

		return cost;
	}


	priorByOffset (offset) {
		const distance = Math.abs(this.offset - offset) / 1;//(this.s_note.deltaSi + 0.04);

		return Math.tanh(this.value * Config.PriorValueSigmoidFactor) - Math.tanh(distance * Config.PriorDistanceSigmoidFactor);
		//return Math.log(this.value) * Math.tanh(4 / distance);
		//return this.value - distance;
	}


	static zero () {
		return {
			zero: true,
			totalCost: 0,
			value: 0,
			si: -1,
			ci: -1,
			deep: 0,
			offset: 0,
		};
	}
};



module.exports = Node;
