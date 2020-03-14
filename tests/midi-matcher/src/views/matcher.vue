<template>
	<div>
		<p>
			matcher
		</p>
	</div>
</template>

<script>
	//import { MidiRoll } from "@k-l-lambda/web-widgets";



	export default {
		name: "matcher",


		props: {
			midiURL: String,
		},


		components: {
		},


		data () {
			return {
				viewHieght: 200,
				viewTimeScale: 1e-3,
			};
		},
	};
</script>
