<template>
	<g class="piano-roll-root mw-svg-piano-roll">
		<g v-for="(note, i) of notationObj.notes" :key="i" class="note" :transform="`translate(${note.start * timeScale}, ${-note.pitch * pitchScale})`">
			<rect
				:width="note.duration * timeScale"
				:height="pitchScale"
				@click="onClickNote(note)"
				:class="[{
					focus: note.index === focusNoteIndex,
					on: note.on,
				}, note.classes]"
			/>
			<line :x1="0" :x2="0" :y1="0" :y2="pitchScale" />
			<title v-if="tooltips">
				p: {{note.pitch}}
				<tspan v-if="note.id">
					id: {{note.id}}
				</tspan>
			</title>
		</g>
	</g>
</template>

<script>
	export default {
		name: "svg-piano-roll",


		props: {
			notation: Object,
			// deprecated
			notations: Object,
			// ms to px
			timeScale: {
				type: Number,
				default: 1e-3,
			},
			// pitch to px
			pitchScale: {
				type: Number,
				default: 1,
			},
			focusNoteIndex: Number,
			tooltips: {
				type: Boolean,
				default: false,
			},
		},


		computed: {
			notationObj () {
				if (this.notation)
					return this.notation;

				if (this.notations) {
					console.warn("property of 'notations' deprecated, replace by 'notation'.");
					return this.notations;
				}

				console.warn("property of 'notation' is required.");
				return null;
			},
		},


		methods: {
			onClickNote (note) {
				this.$emit("clickNote", note);
			},
		},
	};
</script>

<style>
	g.mw-svg-piano-roll .note
	{
		cursor: pointer;
		opacity: 0.6;
	}

	g.mw-svg-piano-roll .note:hover rect,
	g.mw-svg-piano-roll .note:hover line
	{
		opacity: 0.9;
		stroke: orange;
		stroke-width: 0.08px;
	}

	g.mw-svg-piano-roll .note.on rect
	{
		fill: #2a2;
	}

	g.mw-svg-piano-roll .note rect
	{
		fill: #555;
	}

	g.mw-svg-piano-roll .note line
	{
		stroke: #111;
		stroke-width: 0.12px;
	}
</style>
