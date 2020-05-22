
export class Navigator {
	zeroNode: any;


	constructor (criterion: Notation, sample: Notation, options: {
		getCursorOffset: () => number,
		outOfPage: () => boolean,
	});

	step (index: number);

	path (options: {fromIndex?: number, toIndex?: number}): number[];

	nullSteps(index: number): number;

	resetCursor(index: number): boolean;

	get relocationTendency (): number;
}
