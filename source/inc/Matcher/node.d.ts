
interface Note {
	start: number;
	pitch: number;
}


declare class Node {
	s_note: Note;
	c_note: Note;


	constructor (s_note: Note, c_note: Note);

	get prev (): Node;
	set prev (value: Node);

	get si (): number;
	get ci (): number;

	get root (): Node;

	get rootSi (): number;

	get id (): string;

	get totalCost (): number;

	get value (): number;

	get deep (): number;

	get path (): number[];

	evaluatePrev (node: Node): boolean;

	evaluatePrevCost (node: Node): number;

	priorByOffset (offset: number): number;


	static cost (prev: number, skip: number, self: number): number;

	static zero (): object;
}
