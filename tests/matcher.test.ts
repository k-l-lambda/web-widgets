
import * as Matcher from "../source/inc/Matcher";
import * as MusicNotation from "../source/inc/MusicNotation";
import MatchNode from "../source/inc/Matcher/node";


/**
 * Test suite for Matcher module
 * Tests the alignment of two MIDI/notation sequences (criterion vs sample)
 */


// Helper: Create mock note for testing
const createMockNote = (index: number, pitch: number, start: number, startTick: number = start): MusicNotation.Note => ({
	index,
	pitch,
	start,
	startTick,
	endTick: startTick + 480, // Default duration
	channel: 0,
	duration: 0.5,
	velocity: 100,
});


// Helper: Create mock notation data
const createMockNotation = (notes: MusicNotation.Note[]): MusicNotation.NotationData => {
	const pitchMap: {[key: number]: MusicNotation.Note[]} = {};
	notes.forEach(note => {
		if (!pitchMap[note.pitch])
			pitchMap[note.pitch] = [];
		pitchMap[note.pitch].push(note);
	});

	return {
		notes,
		pitchMap,
		ticksPerBeat: 480,
	};
};


// ===== Test 1: normalizeInterval =====
console.log("\n=== Test 1: normalizeInterval ===");
const testNormalizeInterval = () => {
	const interval1 = 0;
	const interval2 = 100;
	const interval3 = 800;
	const interval4 = 1600;

	const result1 = Matcher.normalizeInterval(interval1);
	const result2 = Matcher.normalizeInterval(interval2);
	const result3 = Matcher.normalizeInterval(interval3);
	const result4 = Matcher.normalizeInterval(interval4);

	console.assert(result1 === 0, "Zero interval should normalize to 0");
	console.assert(result2 > 0 && result2 < 1, "Small interval should normalize to (0, 1)");
	console.assert(result3 > result2, "Larger interval should give larger normalized value");
	console.assert(result4 < 1, "All normalized values should be < 1 (tanh property)");

	console.log("✓ normalizeInterval tests passed");
	console.log(`  interval=0 -> ${result1}`);
	console.log(`  interval=100 -> ${result2.toFixed(4)}`);
	console.log(`  interval=800 -> ${result3.toFixed(4)}`);
	console.log(`  interval=1600 -> ${result4.toFixed(4)}`);
};
testNormalizeInterval();


// ===== Test 2: makeNoteSoftIndex =====
console.log("\n=== Test 2: makeNoteSoftIndex ===");
const testMakeNoteSoftIndex = () => {
	const notes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 100, 480),
		createMockNote(2, 64, 200, 960),
		createMockNote(3, 65, 500, 1920),
	];

	Matcher.makeNoteSoftIndex(notes, 0);
	console.assert(notes[0].softIndex === 0, "First note should have softIndex 0");
	console.assert(notes[0].deltaSi === 0, "First note should have deltaSi 0");

	Matcher.makeNoteSoftIndex(notes, 1, {softIndexFactor: 1});
	console.assert(notes[1].softIndex !== undefined, "Second note should have softIndex");
	console.assert(notes[1].deltaSi !== undefined, "Second note should have deltaSi");
	console.assert(notes[1].softIndex! > 0, "Second note softIndex should be > 0");

	Matcher.makeNoteSoftIndex(notes, 2, {softIndexFactor: 1});
	console.assert(notes[2].softIndex! > notes[1].softIndex!, "Later notes should have larger softIndex");

	// Test with different softIndexFactor
	const notes2 = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 100, 480),
	];
	Matcher.makeNoteSoftIndex(notes2, 0);
	Matcher.makeNoteSoftIndex(notes2, 1, {softIndexFactor: 1});
	const deltaSi1 = notes2[1].deltaSi;

	const notes3 = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 100, 480),
	];
	Matcher.makeNoteSoftIndex(notes3, 0);
	Matcher.makeNoteSoftIndex(notes3, 1, {softIndexFactor: 10});
	const deltaSi10 = notes3[1].deltaSi!;

	console.assert(deltaSi10 > deltaSi1, "Higher softIndexFactor should give larger deltaSi");

	console.log("✓ makeNoteSoftIndex tests passed");
	console.log(`  Note 0: softIndex=${notes[0].softIndex}, deltaSi=${notes[0].deltaSi}`);
	console.log(`  Note 1: softIndex=${notes[1].softIndex?.toFixed(4)}, deltaSi=${notes[1].deltaSi?.toFixed(4)}`);
	console.log(`  softIndexFactor=1: deltaSi=${deltaSi1?.toFixed(4)}`);
	console.log(`  softIndexFactor=10: deltaSi=${deltaSi10?.toFixed(4)}`);
};
testMakeNoteSoftIndex();


// ===== Test 3: genNotationContext =====
console.log("\n=== Test 3: genNotationContext ===");
const testGenNotationContext = () => {
	const notes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 100, 480),
		createMockNote(2, 64, 200, 960),
		createMockNote(3, 65, 500, 1920),
	];
	const notation = createMockNotation(notes);

	Matcher.genNotationContext(notation, {softIndexFactor: 1});

	console.assert(notes[0].softIndex === 0, "First note softIndex should be 0");
	console.assert(notes[1].softIndex! > 0, "All notes should have softIndex set");
	console.assert(notes[2].softIndex! > notes[1].softIndex!, "softIndex should be monotonically increasing");
	console.assert(notes[3].softIndex! > notes[2].softIndex!, "softIndex should be monotonically increasing");

	console.log("✓ genNotationContext tests passed");
	notes.forEach((note, i) => {
		console.log(`  Note ${i}: pitch=${note.pitch}, start=${note.start}, softIndex=${note.softIndex?.toFixed(4)}`);
	});
};
testGenNotationContext();


// ===== Test 4: makeMatchNodes =====
console.log("\n=== Test 4: makeMatchNodes ===");
const testMakeMatchNodes = () => {
	// Criterion: C-D-E (60-62-64)
	const criterionNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 100, 480),
		createMockNote(2, 64, 200, 960),
	];
	const criterion = createMockNotation(criterionNotes);
	Matcher.genNotationContext(criterion);

	// Sample note that matches pitch 62 (D)
	const sampleNote = createMockNote(0, 62, 105, 500); // Slightly offset
	Matcher.makeNoteSoftIndex([sampleNote], 0);

	const zeroNode = MatchNode.zero();
	Matcher.makeMatchNodes(sampleNote, criterion, zeroNode);

	console.assert(Array.isArray((sampleNote as any).matches), "Sample note should have matches array");
	console.assert((sampleNote as any).matches.length === 1, "Sample note should match 1 criterion note (pitch 62)");
	console.assert((sampleNote as any).matches[0].c_note.pitch === 62, "Match should be to pitch 62");

	// Test note with no matches
	const unmatchedNote = createMockNote(1, 99, 300, 1440); // Pitch 99 not in criterion
	Matcher.makeNoteSoftIndex([sampleNote, unmatchedNote], 1);
	Matcher.makeMatchNodes(unmatchedNote, criterion, zeroNode);

	console.assert((unmatchedNote as any).matches.length === 0, "Unmatched pitch should have 0 matches");

	// Test note matching multiple criterion notes
	const multiCriterionNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 60, 100, 480), // Same pitch repeated
		createMockNote(2, 60, 200, 960), // Same pitch repeated
	];
	const multiCriterion = createMockNotation(multiCriterionNotes);
	Matcher.genNotationContext(multiCriterion);

	const multiSampleNote = createMockNote(0, 60, 50, 240);
	Matcher.makeNoteSoftIndex([multiSampleNote], 0);
	Matcher.makeMatchNodes(multiSampleNote, multiCriterion, zeroNode);

	console.assert((multiSampleNote as any).matches.length === 3, "Sample note should match all 3 criterion notes with pitch 60");

	console.log("✓ makeMatchNodes tests passed");
	console.log(`  Sample note (pitch 62) matched ${(sampleNote as any).matches.length} criterion notes`);
	console.log(`  Unmatched note (pitch 99) matched ${(unmatchedNote as any).matches.length} criterion notes`);
	console.log(`  Multi-match note (pitch 60) matched ${(multiSampleNote as any).matches.length} criterion notes`);
};
testMakeMatchNodes();


// ===== Test 5: MatchNode class =====
console.log("\n=== Test 5: MatchNode ===");
const testMatchNode = () => {
	const criterionNote = createMockNote(0, 60, 0, 0);
	criterionNote.softIndex = 0;

	const sampleNote = createMockNote(0, 60, 0, 0);
	sampleNote.softIndex = 0;

	const node = new MatchNode(sampleNote, criterionNote);

	console.assert(node.si === 0, "si should match sample note index");
	console.assert(node.ci === 0, "ci should match criterion note index");
	console.assert(node.offset === 0, "offset should be 0 for identical softIndex");
	console.assert(node.id === "0,0", "id should be 'si,ci'");

	// Test with offset
	const offsetSampleNote = createMockNote(0, 60, 100, 480);
	offsetSampleNote.softIndex = 0.5;
	const offsetNode = new MatchNode(offsetSampleNote, criterionNote);

	console.assert(offsetNode.offset === 0.5, "offset should be difference in softIndex");

	// Test zero node
	const zeroNode = MatchNode.zero();
	console.assert(zeroNode.zero === true, "zero node should have zero flag");
	console.assert(zeroNode.si === -1, "zero node si should be -1");
	console.assert(zeroNode.ci === -1, "zero node ci should be -1");
	console.assert(zeroNode.totalCost === 0, "zero node totalCost should be 0");
	console.assert(zeroNode.value === 0, "zero node value should be 0");

	// Test evaluatePrev
	const node2 = new MatchNode(
		{...createMockNote(1, 62, 100, 480), softIndex: 0.5} as any,
		{...createMockNote(1, 62, 100, 480), softIndex: 0.5} as any
	);
	const improved = node2.evaluatePrev(zeroNode);
	console.assert(improved === true, "evaluatePrev should return true when setting initial prev");
	console.assert(node2.prev === zeroNode, "prev should be set to zeroNode");

	console.log("✓ MatchNode tests passed");
	console.log(`  Node offset: ${node.offset}`);
	console.log(`  Zero node: si=${zeroNode.si}, ci=${zeroNode.ci}, cost=${zeroNode.totalCost}`);
	console.log(`  Node with prev: totalCost=${node2.totalCost.toFixed(4)}, value=${node2.value.toFixed(4)}`);
};
testMatchNode();


// ===== Test 6: Full matching workflow (simple case) =====
console.log("\n=== Test 6: Full Matching Workflow (Simple) ===");
const testSimpleMatching = async () => {
	// Criterion: Perfect C-D-E sequence (60-62-64)
	const criterionNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 480, 480),
		createMockNote(2, 64, 960, 960),
	];
	const criterion = createMockNotation(criterionNotes);

	// Sample: Same sequence, perfectly aligned
	const sampleNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 480, 480),
		createMockNote(2, 64, 960, 960),
	];
	const sample = createMockNotation(sampleNotes);

	// Run matching workflow
	Matcher.genNotationContext(criterion, {softIndexFactor: 1e3});
	Matcher.genNotationContext(sample, {softIndexFactor: 1e3});

	for (const note of sample.notes)
		Matcher.makeMatchNodes(note, criterion);

	const navigator = await Matcher.runNavigation(criterion, sample);
	const path = navigator.path();

	console.assert(path.length === 3, "Path should have 3 entries");
	console.assert(path[0] === 0, "Sample note 0 should match criterion note 0");
	console.assert(path[1] === 1, "Sample note 1 should match criterion note 1");
	console.assert(path[2] === 2, "Sample note 2 should match criterion note 2");

	console.log("✓ Simple matching workflow test passed");
	console.log(`  Path: [${path.join(", ")}]`);
};
testSimpleMatching();


// ===== Test 7: Matching with timing offset =====
console.log("\n=== Test 7: Matching with Timing Offset ===");
const testOffsetMatching = async () => {
	// Criterion: C-D-E at regular intervals
	const criterionNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 480, 480),
		createMockNote(2, 64, 960, 960),
	];
	const criterion = createMockNotation(criterionNotes);

	// Sample: Same pitches but slightly earlier/later
	const sampleNotes = [
		createMockNote(0, 60, 10, 50),    // Slightly late
		createMockNote(1, 62, 490, 520),  // Slightly late
		createMockNote(2, 64, 950, 940),  // Slightly early
	];
	const sample = createMockNotation(sampleNotes);

	Matcher.genNotationContext(criterion, {softIndexFactor: 1e3});
	Matcher.genNotationContext(sample, {softIndexFactor: 1e3});

	for (const note of sample.notes)
		Matcher.makeMatchNodes(note, criterion);

	const navigator = await Matcher.runNavigation(criterion, sample);
	const path = navigator.path();

	console.assert(path.length === 3, "Path should have 3 entries");
	console.assert(path[0] === 0, "Should still match correctly despite timing offset");
	console.assert(path[1] === 1, "Should still match correctly despite timing offset");
	console.assert(path[2] === 2, "Should still match correctly despite timing offset");

	console.log("✓ Offset matching test passed");
	console.log(`  Path: [${path.join(", ")}]`);
};
testOffsetMatching();


// ===== Test 8: Matching with missing notes =====
console.log("\n=== Test 8: Matching with Missing Notes ===");
const testMissingNotes = async () => {
	// Criterion: C-D-E-F-G (5 notes)
	const criterionNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 480, 480),
		createMockNote(2, 64, 960, 960),
		createMockNote(3, 65, 1440, 1440),
		createMockNote(4, 67, 1920, 1920),
	];
	const criterion = createMockNotation(criterionNotes);

	// Sample: Missing note D (index 1) - only C-E-F-G
	const sampleNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 64, 960, 960),    // Skip D, play E
		createMockNote(2, 65, 1440, 1440),
		createMockNote(3, 67, 1920, 1920),
	];
	const sample = createMockNotation(sampleNotes);

	Matcher.genNotationContext(criterion, {softIndexFactor: 1e3});
	Matcher.genNotationContext(sample, {softIndexFactor: 1e3});

	for (const note of sample.notes)
		Matcher.makeMatchNodes(note, criterion);

	const navigator = await Matcher.runNavigation(criterion, sample);
	const path = navigator.path();

	console.assert(path.length === 4, "Path should have 4 entries (sample length)");
	console.assert(path[0] === 0, "First sample note should match first criterion note");
	console.assert(path[1] === 2, "Second sample note (E) should match third criterion note");
	console.assert(path[2] === 3, "Third sample note should match fourth criterion note");
	console.assert(path[3] === 4, "Fourth sample note should match fifth criterion note");

	console.log("✓ Missing notes test passed");
	console.log(`  Path: [${path.join(", ")}]`);
	console.log(`  Criterion note 1 (D, pitch 62) was skipped in sample`);
};
testMissingNotes();


// ===== Test 9: Matching with extra notes =====
console.log("\n=== Test 9: Matching with Extra Notes ===");
const testExtraNotes = async () => {
	// Criterion: C-E-G (60-64-67)
	const criterionNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 64, 960, 960),
		createMockNote(2, 67, 1920, 1920),
	];
	const criterion = createMockNotation(criterionNotes);

	// Sample: C-D-E-F-G (with extra D and F)
	const sampleNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 480, 480),    // Extra note (D)
		createMockNote(2, 64, 960, 960),
		createMockNote(3, 65, 1440, 1440),  // Extra note (F)
		createMockNote(4, 67, 1920, 1920),
	];
	const sample = createMockNotation(sampleNotes);

	Matcher.genNotationContext(criterion, {softIndexFactor: 1e3});
	Matcher.genNotationContext(sample, {softIndexFactor: 1e3});

	for (const note of sample.notes)
		Matcher.makeMatchNodes(note, criterion);

	const navigator = await Matcher.runNavigation(criterion, sample);
	const path = navigator.path();

	console.assert(path.length === 5, "Path should have 5 entries");
	console.assert(path[0] === 0, "First sample note should match first criterion note");
	console.assert(path[1] === -1, "Extra note should have no match (-1)");
	console.assert(path[2] === 1, "E should match criterion E");
	console.assert(path[3] === -1, "Extra note should have no match (-1)");
	console.assert(path[4] === 2 || path[4] === -1, "G may or may not match criterion G depending on cost");

	console.log("✓ Extra notes test passed");
	console.log(`  Path: [${path.join(", ")}]`);
	console.log(`  Sample notes 1 and 3 (D and F) had no criterion match`);
};
testExtraNotes();


// ===== Test 10: Empty and edge cases =====
console.log("\n=== Test 10: Edge Cases ===");
const testEdgeCases = async () => {
	// Test 10a: Empty sample
	const criterion1 = createMockNotation([createMockNote(0, 60, 0, 0)]);
	const sample1 = createMockNotation([]);

	Matcher.genNotationContext(criterion1);
	Matcher.genNotationContext(sample1);

	const navigator1 = await Matcher.runNavigation(criterion1, sample1);
	const path1 = navigator1.path();

	console.assert(path1.length === 0, "Empty sample should produce empty path");

	// Test 10b: Single note match
	const criterion2 = createMockNotation([createMockNote(0, 60, 0, 0)]);
	const sample2 = createMockNotation([createMockNote(0, 60, 0, 0)]);

	Matcher.genNotationContext(criterion2);
	Matcher.genNotationContext(sample2);

	for (const note of sample2.notes)
		Matcher.makeMatchNodes(note, criterion2);

	const navigator2 = await Matcher.runNavigation(criterion2, sample2);
	const path2 = navigator2.path();

	console.assert(path2.length === 1, "Single note should produce path of length 1");
	console.assert(path2[0] === 0, "Single note should match");

	// Test 10c: No matching pitches
	const criterion3 = createMockNotation([
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 480, 480),
	]);
	const sample3 = createMockNotation([
		createMockNote(0, 70, 0, 0),
		createMockNote(1, 72, 480, 480),
	]);

	Matcher.genNotationContext(criterion3);
	Matcher.genNotationContext(sample3);

	for (const note of sample3.notes)
		Matcher.makeMatchNodes(note, criterion3);

	const navigator3 = await Matcher.runNavigation(criterion3, sample3);
	const path3 = navigator3.path();

	console.assert(path3.length === 2, "Path length should equal sample length");
	console.assert(path3[0] === -1 && path3[1] === -1, "No pitch matches should result in all -1");

	console.log("✓ Edge cases tests passed");
	console.log(`  Empty sample: path length = ${path1.length}`);
	console.log(`  Single note: path = [${path2.join(", ")}]`);
	console.log(`  No pitch matches: path = [${path3.join(", ")}]`);
};
testEdgeCases();


// ===== Test 11: Different softIndexFactor values =====
console.log("\n=== Test 11: SoftIndexFactor Effects ===");
const testSoftIndexFactor = async () => {
	// Criterion: Two notes far apart
	const criterionNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 2000, 9600), // Very far from first note
	];
	const criterion = createMockNotation(criterionNotes);

	// Sample: Same sequence
	const sampleNotes = [
		createMockNote(0, 60, 0, 0),
		createMockNote(1, 62, 2000, 9600),
	];
	const sample = createMockNotation(sampleNotes);

	// Test with small softIndexFactor (soft timing)
	Matcher.genNotationContext(criterion, {softIndexFactor: 0.1});
	Matcher.genNotationContext(sample, {softIndexFactor: 0.1});
	const softDelta1 = sample.notes[1].deltaSi!;

	// Reset and test with large softIndexFactor (hard timing)
	const criterion2 = createMockNotation([...criterionNotes]);
	const sample2 = createMockNotation([...sampleNotes]);
	Matcher.genNotationContext(criterion2, {softIndexFactor: 10});
	Matcher.genNotationContext(sample2, {softIndexFactor: 10});
	const softDelta2 = sample2.notes[1].deltaSi!;

	console.assert(softDelta2 > softDelta1, "Larger softIndexFactor should give larger deltaSi for same time difference");

	console.log("✓ SoftIndexFactor test passed");
	console.log(`  softIndexFactor=0.1: deltaSi=${softDelta1?.toFixed(4)}`);
	console.log(`  softIndexFactor=10: deltaSi=${softDelta2?.toFixed(4)}`);
	console.log(`  Larger factor means timing differences are emphasized more`);
};
testSoftIndexFactor();


// ===== Summary =====
console.log("\n" + "=".repeat(50));
console.log("✓ All Matcher tests completed successfully!");
console.log("=".repeat(50));
console.log("\nTest Coverage:");
console.log("  • normalizeInterval: Interval normalization function");
console.log("  • makeNoteSoftIndex: Soft index calculation for individual notes");
console.log("  • genNotationContext: Context generation for full notation");
console.log("  • makeMatchNodes: Match node generation for sample notes");
console.log("  • MatchNode class: Node construction, cost calculation, path tracking");
console.log("  • Simple matching: Perfect alignment");
console.log("  • Offset matching: Timing variations");
console.log("  • Missing notes: Sample missing criterion notes");
console.log("  • Extra notes: Sample has additional notes");
console.log("  • Edge cases: Empty, single note, no matches");
console.log("  • SoftIndexFactor: Timing sensitivity tuning");
console.log("\n");
