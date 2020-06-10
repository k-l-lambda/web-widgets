
import Node from "./node";
import {Notation, NotationData} from "../MusicNotation";



declare class Navigator {
	zeroNode: any;
	cursors: Node[];
	fineCursor?: Node;


	constructor (criterion: Notation, sample: NotationData, options: {
		getCursorOffset: () => number,
		outOfPage: (tick: number) => boolean,
	});

	step (index: number);

	path (options?: {fromIndex?: number, toIndex?: number}): number[];

	nullSteps(index: number): number;

	resetCursor(index: number): boolean;

	relocationTendency: number;
}



export default Navigator;
