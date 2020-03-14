
/// <reference path="./node.d.ts" />
/// <reference path="./navigator.d.ts" />



declare module Matcher {
	function makeMatchNodes(note: Note, criterion: Notation, zeroNode?: object);
	function genNotationContext(notation: Notation);
	function runNavigation(criterion: Notation, sample: Notation, onStep: (i: number, navigator: Navigator) => Symbol | Promise<Symbol>): Promise<Navigator>;
}
