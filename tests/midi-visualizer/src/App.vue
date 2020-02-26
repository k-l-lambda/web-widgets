<template>
	<div id="app">
		<p><img alt="Vue logo" src="./assets/logo.png"></p>
		<MidiRoll :midiURL="midiURL" />
	</div>
</template>

<script>
	import { MidiRoll } from "@k-l-lambda/web-widgets";



	export default {
		name: "App",


		components: {
			MidiRoll,
		},


		data () {
			return {
				midiURL: null,
			};
		},


		async created () {
			const {default: url} = await import("./assets/C_major_scale.mid");
			this.midiURL = url;
		},
	};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
