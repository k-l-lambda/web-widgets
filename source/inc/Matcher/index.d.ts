
import Navigator from "./navigator";
import Node from "./node";

import {Note, NotationData} from "../MusicNotation";



declare const normalizeInterval: (interval: number) => number;
declare const makeNoteSoftIndex: (notes: Note[], index: number) => void;
declare const makeMatchNodes: (note: Note, criterion: NotationData, zeroNode?: object) => void;
declare const genNotationContext: (notation: NotationData, options?: {softIndexFactor?: number}) => void;
declare const runNavigation: (criterion: NotationData, sample: NotationData, onStep?: (i: number, navigator: Navigator) => Symbol | Promise<Symbol>) => Promise<Navigator>;



export {
	normalizeInterval,
	makeNoteSoftIndex,
	makeMatchNodes,
	genNotationContext,
	runNavigation,
	Navigator,
	Node,
};
