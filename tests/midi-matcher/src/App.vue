<template>
	<div id="app"
		:class="{hover: dragHover}"
		@dragover.prevent="dragHover = true"
		@dragleave="dragHover = false"
		@drop.prevent="onDrop"
	>
		<Matcher :criterion="criterion" :sample="sample" />
	</div>
</template>

<script>
	import { MIDI, MusicNotation } from "@k-l-lambda/web-widgets";

	import Matcher from "./views/matcher.vue";



	const loadMidiNotation = buffer => {
		const midi = MIDI.parseMidiData(buffer);
		return MusicNotation.Notation.parseMidi(midi);
	};



	export default {
		name: "App",


		components: {
			Matcher,
		},


		data () {
			return {
				criterion: null,
				sample: null,
				dragHover: false,
				viewHieght: 200,
				viewTimeScale: 1e-3,
			};
		},


		async created () {
			const { default: urlC } = await import("./assets/criterion.mid");
			const bufferC = await (await fetch(urlC)).arrayBuffer();
			this.criterion = loadMidiNotation(bufferC);

			const { default: urlS } = await import("./assets/sample.mid");
			const bufferS = await (await fetch(urlS)).arrayBuffer();
			this.sample = loadMidiNotation(bufferS);
		},


		methods: {
			async onDrop (event) {
				this.dragHover = false;

				console.log("event:", event);
				/*const file = event.dataTransfer.files[0];
				if (file && ["audio/midi", "audio/mid"].includes(file.type)) {
					this.midiURL = await new Promise(resolve => {
						const fr = new FileReader();
						fr.onload = () => resolve(fr.result);
						fr.readAsDataURL(file);
					});
				}*/
			},
		},
	};
</script>

<style>
	#app
	{
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}

	#app.hover
	{
		background-color: #efe;
	}
</style>
