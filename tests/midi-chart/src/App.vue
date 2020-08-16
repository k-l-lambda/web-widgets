<template>
	<div id="app"
		:class="{hover: dragHover}"
		@dragover.prevent="dragHover = true"
		@dragleave="dragHover = false"
		@drop.prevent="onDrop"
	>
		<ViewChart :midiURL="midiURL" />
	</div>
</template>

<script>
	import ViewChart from "./views/chart.vue";



	export default {
		name: "App",


		components: {
			ViewChart,
		},


		data () {
			return {
				midiURL: null,
				dragHover: false,
			};
		},


		async created () {
			const {default: url} = await import("./assets/C_major_scale.mid");
			this.midiURL = url;
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
