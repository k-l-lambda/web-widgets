<template>
	<div id="app">
		<img alt="Vue logo" src="./assets/logo.png">
		<MidiRoll midiURL="test" />
	</div>
</template>

<script>
	import {MidiRoll} from "@k-l-lambda/web-widgets";



	export default {
		name: "App",


		components: {
			MidiRoll,
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
