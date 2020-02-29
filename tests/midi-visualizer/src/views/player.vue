<template>
	<div>
		<p>
			<button @click="togglePlayer" :disabled="!player">{{player && player.isPlaying ? "pause" : "play"}}</button>
			<em v-if="player">{{(player.progressTime / 1000).toFixed(2)}}</em>s
			Height: <input type="number" v-model.number="viewHieght" />
			Width: <input type="number" v-model.number="viewWidth" />
			TimeScale: <input type="number" v-model.number="viewTimeScale" />
		</p>
		<MidiRoll :player="player" :height="viewHieght" :width="viewWidth" :timeScale="viewTimeScale" />
	</div>
</template>

<script>
	import { MidiRoll, MIDI, MidiPlayer, MidiAudio } from "@k-l-lambda/web-widgets";



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
				viewWidth: 600,
				viewTimeScale: 1e-3,
				player: null,
				midiAudioLoaded: false,
			};
		},


		created () {
			this.loadPlayer();

			if (MidiAudio.WebAudio.empty())
				MidiAudio.loadPlugin({ soundfontUrl: "/soundfont/", api: "webaudio" }).then(() => this.midiAudioLoaded = true);
			else
				this.midiAudioLoaded = true;
		},


		methods: {
			async loadPlayer () {
				if (this.player) {
					this.player.dispose();
					this.player = null;
				}

				if (this.midiURL) {
					const buffer = await (await fetch(this.midiURL)).arrayBuffer();
					const midi = MIDI.parseMidiData(buffer);

					this.player = new MidiPlayer(midi, {
						onMidi: (data, timestamp) => this.onMidi(data, timestamp),
						onPlayFinish: () => this.onFinish(),
					});
					//console.log("notations:", this.notations);
				}
			},


			onMidi (data, timestamp) {
				//console.log("onMidi:", data.subtype, timestamp, data);

				if (this.midiAudioLoaded) {
					const delay = (timestamp - performance.now()) * 1e-3;	// in seconds

					switch (data.subtype) {
					case "noteOn":
						MidiAudio.noteOn(data.channel, data.noteNumber, data.velocity, delay);

						break;
					case "noteOff":
						MidiAudio.noteOff(data.channel, data.noteNumber, delay);

						break;
					}
				}
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
			midiURL: "loadPlayer",


			midiAudioLoaded (value) {
				if (value)
					console.log("soundfound loaded.");
			},
		},
	};
</script>

<style scoped>
	input[type=number]
	{
		width: 4em;
	}
</style>
