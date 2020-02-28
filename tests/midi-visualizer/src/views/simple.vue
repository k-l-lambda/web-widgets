<template>
	<div>
		<p>
			Height: <input type="number" v-model.number="viewHieght" />
			TimeScale: <input type="number" v-model.number="viewTimeScale" />
		</p>
		<MidiRoll :midiURL="midiURL" :height="viewHieght" :timeScale="viewTimeScale" />
	</div>
</template>

<script>
	import { MidiRoll } from "@k-l-lambda/web-widgets";



	export default {
		name: "simple",


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
			};
		},
	};
</script>
