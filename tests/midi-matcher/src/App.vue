<template>
	<div id="app"
		:class="{hover: dragHover}"
		@dragover.prevent="dragHover = true"
		@dragleave="dragHover = false"
		@drop.prevent="onDrop"
	>
		<p><img alt="Vue logo" src="./assets/logo.png"></p>
		<Matcher />
	</div>
</template>

<script>
	import Matcher from "./views/matcher.vue";



	export default {
		name: "App",


		components: {
			Matcher,
		},


		data () {
			return {
				midiURL: null,
				dragHover: false,
				viewHieght: 200,
				viewTimeScale: 1e-3,
			};
		},


		async created () {
		},


		methods: {
			async onDrop (event) {
				this.dragHover = false;

				const file = event.dataTransfer.files[0];
				if (file && ["audio/midi", "audio/mid"].includes(file.type)) {
					this.midiURL = await new Promise(resolve => {
						const fr = new FileReader();
						fr.onload = () => resolve(fr.result);
						fr.readAsDataURL(file);
					});
				}
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
