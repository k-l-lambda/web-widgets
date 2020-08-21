<template>
	<div>
		<p>
			<button @click="match" :disabled="!criterion || !sample">match</button>
		</p>
		<svg xmlns="http://www.w3.org/2000/svg" height="480" viewBox="-20 -20 1000 160">
			<g :transform="`translate(${positionC.x}, ${positionC.y})`">
				<PinaoRoll v-if="criterion" :notation="criterion" :timeScale="timeScale" :pitchScale="1" />
			</g>
			<g :transform="`translate(${positionS.x}, ${positionS.y})`">
				<PinaoRoll v-if="sample" :notation="sample" :timeScale="timeScale" :pitchScale="1" />
			</g>
			<g class="links">
				<line v-for="link of links" :key="link.s.index"
					:x1="positionS.x + link.s.start * timeScale"
					:x2="positionC.x + link.c.start * timeScale"
					:y1="positionS.y - link.s.pitch + 0.5"
					:y2="positionC.y - link.c.pitch + 0.5"
				/>
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
				positionC: { x: 0, y: 90 },
				positionS: { x: 0, y: 160 },
				path: [],
			};
		},


		computed: {
			links () {
				return this.path.map((ci, si) => ({ ci, si })).filter(({ ci }) => ci >= 0).map(({ ci, si }) => ({
					c: this.criterion.notes[ci],
					s: this.sample.notes[si],
				}));
			},
		},


		methods: {
			async match () {
				Matcher.genNotationContext(this.criterion);
				Matcher.genNotationContext(this.sample);

				for (const note of this.sample.notes)
					Matcher.makeMatchNodes(note, this.criterion);

				const navigator = await Matcher.runNavigation(this.criterion, this.sample);
				this.path = navigator.path();
				//console.log("path:", navigator.path());
			},
		},
	};
</script>

<style scoped>
	.links line
	{
		stroke: black;
		stroke-width: 0.1px;
	}
</style>
