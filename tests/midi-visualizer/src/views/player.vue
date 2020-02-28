<template>
	<div>
		<p>
			<button @click="togglePlayer" :disabled="!player">{{player && player.isPlaying ? "pause" : "play"}}</button>
			<em v-if="player">{{(player.progressTime / 1000).toFixed(2)}}</em>s
			Height: <input type="number" v-model.number="viewHieght" />
			TimeScale: <input type="number" v-model.number="viewTimeScale" />
		</p>
		<MidiRoll :player="player" :height="viewHieght" :timeScale="viewTimeScale" />
	</div>
</template>

<script>
	import { MidiRoll, MIDI, MidiPlayer } from "@k-l-lambda/web-widgets";



	export default {
		name: "player",


		props: {
			midiURL: String,
		},


		components: {
			MidiRoll,
		},


		data () {
			return {
				viewHieght: 200,
				viewTimeScale: 1e-3,
				player: null,
			};
		},


		created () {
			this.load();
		},


		methods: {
			async load () {
				if (this.player) {
					this.player.dispose();
					this.player = null;
				}

				if (this.midiURL) {
					const buffer = await (await fetch(this.midiURL)).arrayBuffer();
					const midi = MIDI.parseMidiData(buffer);

					this.player = new MidiPlayer(midi, {
						onMidi: data => this.onMidi(data),
						onPlayFinish: () => this.onFinish(),
					});
					//console.log("notations:", this.notations);
				}
			},


			onMidi (data) {
				console.log("onMidi:", data.subtype, data);
			},


			onFinish () {
				this.player.turnCursor(0);
			},


			togglePlayer () {
				if (this.player) {
					if (this.player.isPlaying)
						this.player.pause();
					else
						this.player.play();
				}
			},
		},


		watch: {
			midiURL: "load",
		},
	};
</script>
