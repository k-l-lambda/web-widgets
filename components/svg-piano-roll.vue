<template>
	<g class="piano-roll-root">
		<rect v-for="(note, i) of notations.notes" :key="i"
			class="note"
			:x="note.start * timeScale"
			:y="-note.pitch * pitchScale"
			:width="note.duration * timeScale"
			:height="pitchScale"
			@click="onClickNote(note)"
			:class="{
				focus: note.index === focusNoteIndex, ...(note.classes || {}),
				on: note.on,
			}"
		/>
	</g>
</template>

<script>
	export default {
		name: "svg-piano-roll",


		props: {
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
		},


		methods: {
			onClickNote (note) {
				this.$emit("clickNote", note);
			},
		},
	};
</script>

<style scoped>
	.note
	{
		cursor: pointer;
		opacity: 0.4;
	}

	.note:hover
	{
		opacity: 0.9;
		stroke: orange;
		stroke-width: 0.08px;
	}

	.note.on
	{
		fill: #2a2;
	}
</style>
