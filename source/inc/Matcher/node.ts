
export default class MatchNode {
	s: any;
	c: any;
	path: any[];
	prior: number;
	value: number;
	totalCost: number;
	rootSi: number;
	root: any;


	constructor (sNote, cNote) {
		this.s = sNote;
		this.c = cNote;
		this.path = [];
		this.prior = 0;
		this.value = 0;
		this.totalCost = 0;
		this.rootSi = 0;
		this.root = { si: 0, offset: 0, priorOffset: 0 };
	}

	static zero () {
		const node = new MatchNode({ softIndex: 0, start: 0 }, { softIndex: 0, start: 0 });
		node.root.si = -1;
		node.root.offset = 0;
		node.value = 0;
		node.prior = 0;
		node.totalCost = 0;
		return node;
	}

	evaluatePrev (prev) {
		// Placeholder: original JS had complex logic in navigator/node.
		// Keep compatibility by basic prior calculation.
		this.prior = 1;
		this.value = 1;
		this.totalCost = 0;
		this.rootSi = prev.root ? prev.root.si + 1 : 0;
		this.root = prev.root || { si: -1, offset: 0, priorOffset: 0 };
		this.path = [];
	}
}
 
