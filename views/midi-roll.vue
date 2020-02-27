<template>
	<svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="height">
		<SvgPianoRoll v-if="notations" :notations="notations" :timeScale="timeScale" />
		<g class="scales" v-if="notations">
			<line x1="0" x2="0" :y1="-notations.keyRange.low + 1" y2="-120" />
			<line x1="0" :x2="timeScale * notations.endTime" :y1="-notations.keyRange.low + 1" :y2="-notations.keyRange.low + 1" />
			<g class="bar" v-for="(bar, i) of notations.bars" :key="i">
				<line v-if="bar.index === 0"
					:x1="bar.time * timeScale" :x2="bar.time * timeScale" :y1="-notations.keyRange.low + 1" y2="-120"
				/>
			</g>
			<g class="pitch-bar" v-for="pitch of pitchScales" :key="`p-${pitch}`">
				<line x1="-.6" x2="0" :y1="-pitch + 0.5" :y2="-pitch + 0.5" />
				<text x="-1.5" :y="-pitch + 1" >{{pitch}}</text>
			</g>
			<g class="time-bar" v-for="time of timeScales" :key="`t-${time}`">
				<line :x1="time * timeScale" :x2="time * timeScale" :y1="-notations.keyRange.low + 1" :y2="-notations.keyRange.low + 1.6" />
				<text :x="time * timeScale" :y="-notations.keyRange.low + 3">{{time * 1e-3}}s</text>
			</g>
		</g>
	</svg>	
</template>

<script>
	import { parseMidiData } from "../inc/MIDI";
	import { Notation } from "../inc/MusicNotation.js";

	import SvgPianoRoll from "../components/svg-piano-roll.vue";



	export default {
		name: "midi-roll",


		props: {
			midiURL: String,
			height: {
				type: Number,
				default: 200,
			},
			timeScale: {
				type: Number,
				default: 1e-3,
			},
		},


		components: {
			SvgPianoRoll,
		},


		data () {
			return {
				notations: null,
			};
		},


		computed: {
			viewBox () {
				if (!this.notations)
					return "0 -110 1000 90";

				const {low, high} = this.notations.keyRange;

				return `-3 ${-high} ${this.notations.endTime * this.timeScale + 4} ${high - low + 4}`;
			},


			pitchScales () {
				if (!this.notations)
					return [];

				return Array(9).fill().map((_, i) => i * 12).filter(p => p >= this.notations.keyRange.low);
			},


			timeScales () {
				if (!this.notations)
					return [];

				return Array(Math.ceil(this.notations.endTime / 15e+3)).fill().map((_, i) => i * 15e+3);
			},
		},


		created () {
			this.load();
		},


		methods: {
			async load () {
				this.notations = null;

				if (this.midiURL) {
					const buffer = await (await fetch(this.midiURL)).arrayBuffer();
					const chars = Array.from(new Uint8Array(buffer));
					const midi = parseMidiData(chars.map(b => String.fromCharCode(b)).join(""));

					this.notations = Notation.parseMidi(midi);
					//console.log("notations:", this.notations);
				}
			},
		},


		watch: {
			midiURL: "load",
		},
	};
</script>

<style scoped>
	.scales line
	{
		stroke: black;
		stroke-width: 0.1;
	}

	.scales text
	{
		font-size: 1px;
		text-anchor: middle;
	}

	.bar line
	{
		stroke: black;
		stroke-width: 0.01;
	}

	.pitch-bar line, .time-bar line
	{
		stroke: black;
		stroke-width: 0.06;
	}
</style>
