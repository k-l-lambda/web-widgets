
/// <reference path="./node.d.ts" />
/// <reference path="./navigator.d.ts" />



declare module Matcher {
	export function makeMatchNodes(note: Note, criterion: Notation, zeroNode?: object);
	export function genNotationContext(notation: Notation);
	export function runNavigation(criterion: Notation, sample: Notation, onStep: (i: number, navigator: Navigator) => Symbol | Promise<Symbol>): Promise<Navigator>;
}


declare module "@k-l-lambda/web-widgets/source/inc/Matcher";
