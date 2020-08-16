<template>
	<div>
		chart
	</div>
</template>

<script>
	import { MIDI } from "@k-l-lambda/web-widgets";



	export default {
		name: "midi-chart",


		props: {
			midiURL: String,
		},


		data () {
			return {
				stateSequence: [],
			};
		},


		created () {
			this.load();
		},


		methods: {
			async load () {
				this.stateSequence = [];

				if (!this.midiURL)
					return;

				const buffer = await (await fetch(this.midiURL)).arrayBuffer();
				const midi = MIDI.parseMidiData(buffer);
				console.log("midi:", midi);
			},
		},


		watch: {
			midiURL: "load",
		},
	};
</script>
