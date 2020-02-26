<template>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -110 1000 90">
		<SvgPianoRoll v-if="notations" :notations="notations" />
	</svg>	
</template>

<script>
	import { parseMidiData } from "../inc/MIDI";
	import { Notation } from "../inc/MusicNotation.js";

	import SvgPianoRoll from "../components/svg-piano-roll.vue";



	export default {
		name: "midi-roll",


		props: {
			midiURL: String,
		},


		components: {
			SvgPianoRoll,
		},


		data () {
			return {
				notations: null,
			};
		},


		created () {
			this.load();
		},


		methods: {
			async load () {
				this.notations = null;

				if (this.midiURL) {
					const buffer = await (await fetch(this.midiURL)).arrayBuffer();
					const chars = Array.from(new Uint8Array(buffer));
					const midi = parseMidiData(chars.map(b => String.fromCharCode(b)).join(""));
					console.log("midi:", midi);

					this.notations = Notation.parseMidi(midi);
					console.log("notations:", this.notations);
				}
			},
		},


		watch: {
			midiURL: "load",
		},
	};
</script>
