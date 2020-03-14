<template>
	<div>
		<p>
			<button @click="match" :disabled="!criterion || !sample">match</button>
		</p>
		<svg xmlns="http://www.w3.org/2000/svg" height="480" viewBox="-20 -20 1000 160">
			<g transform="translate(0, 90)">
				<PinaoRoll v-if="criterion" :notations="criterion" :timeScale="timeScale" :pitchScale="1" />
			</g>
			<g transform="translate(0, 160)">
				<PinaoRoll v-if="sample" :notations="sample" :timeScale="timeScale" :pitchScale="1" />
			</g>
		</svg>
	</div>
</template>

<script>
	import PinaoRoll from "@k-l-lambda/web-widgets/source/components/svg-piano-roll.vue";
	import Matcher from "@k-l-lambda/web-widgets/source/inc/Matcher";



	export default {
		name: "matcher",


		props: {
			criterion: Object,
			sample: Object,
		},


		components: {
			PinaoRoll,
		},


		data () {
			return {
				timeScale: 8e-3,
			};
		},


		methods: {
			async match () {
				Matcher.genNotationContext(this.criterion);
				Matcher.genNotationContext(this.sample);

				for (const note of this.sample.notes)
					Matcher.makeMatchNodes(note, this.criterion);

				const navigator = await Matcher.runNavigation(this.criterion, this.sample);
				console.log("path:", navigator.path());
			},
		},
	};
</script>
