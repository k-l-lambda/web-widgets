
interface Note {
	start: number;
	pitch: number;
	softIndex?: number;
	deltaSi?: number;
}


export interface Node {
	s_note: Note;
	c_note: Note;


	constructor (s_note: Note, c_note: Note);

	prev: Node;
	si: number;
	ci: number;
	root: Node;
	rootSi: number;
	id: string;
	totalCost: number;
	value: number;
	deep: number;
	path: number[];

	evaluatePrev (node: Node): boolean;
	evaluatePrevCost (node: Node): number;
	priorByOffset (offset: number): number;


	cost (prev: number, skip: number, self: number): number;
	zero (): object;
}
