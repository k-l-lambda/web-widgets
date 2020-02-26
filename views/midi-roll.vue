<template>
	<svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="height">
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
			height: {
				type: Number,
				default: 200,
			},
		},


		components: {
			SvgPianoRoll,
		},


		data () {
			return {
				notations: null,
			};
		},


		computed: {
			viewBox () {
				if (!this.notations)
					return "0 -110 1000 90";

				const {low, high} = this.notations.keyRange;

				return `0 ${-high} ${this.notations.endTime * 1e-3} ${high - low + 1}`;
			},
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
