
//import {Node} from './node';
//import {Navigator} from './navigator';
/// <reference path="./node.d.ts" />
/// <reference path="./navigator.d.ts" />



//declare module "@k-l-lambda/web-widgets/source/inc/Matcher";



declare namespace Matcher {
	function normalizeInterval(interval: number): number;
	function makeNoteSoftIndex(notes: Note[], index: number);
	function makeMatchNodes(note: Note, criterion: Notation, zeroNode?: object);
	function genNotationContext(notation: Notation);
	function runNavigation(criterion: Notation, sample: Notation, onStep: (i: number, navigator: Navigator) => Symbol | Promise<Symbol>): Promise<Navigator>;
}
