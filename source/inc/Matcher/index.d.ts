
import Navigator from "./navigator";
import Node from "./node";

import {Note} from "../MusicNotation";



interface SimpleNotationData {
	notes: Note[];
}


interface CriterionNotationData extends SimpleNotationData {
	pitchMap: {[key: number]: Note[]};
}


declare const normalizeInterval: (interval: number) => number;
declare const makeNoteSoftIndex: (notes: Note[], index: number) => void;
declare const makeMatchNodes: (note: Note, criterion: CriterionNotationData, zeroNode?: object) => void;
declare const genNotationContext: (notation: SimpleNotationData, options?: {softIndexFactor?: number}) => void;
declare const runNavigation: (criterion: SimpleNotationData, sample: SimpleNotationData, onStep?: (i: number, navigator: Navigator) => Symbol | Promise<Symbol>) => Promise<Navigator>;



export {
	normalizeInterval,
	makeNoteSoftIndex,
	makeMatchNodes,
	genNotationContext,
	runNavigation,
	Navigator,
	Node,
};
