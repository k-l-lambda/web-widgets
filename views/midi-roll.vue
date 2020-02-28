<template>
	<svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="height">
		<g v-if="progressTime" class="progress">
			<rect :x="0" :y="-120" :height="121 - notations.keyRange.low" :width="progressTime * timeScale" />
			<line :x1="progressTime * timeScale" :x2="progressTime * timeScale" :y1="-notations.keyRange.low + 1" y2="-120" />
		</g>
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
				<line x1="-.8" x2="0" :y1="-pitch + 0.5" :y2="-pitch + 0.5" />
				<text x="-2" :y="-pitch + 1" >{{pitch}}</text>
			</g>
			<g class="time-bar" v-for="time of timeScales" :key="`t-${time}`">
				<line :x1="time * timeScale" :x2="time * timeScale" :y1="-notations.keyRange.low + 1" :y2="-notations.keyRange.low + 1.8" />
				<text :x="time * timeScale" :y="-notations.keyRange.low + 4">{{time * 1e-3}}s</text>
			</g>
		</g>
	</svg>	
</template>

<script>
	import Vue from "vue";

	import { parseMidiData } from "../inc/MIDI";
	import { Notation } from "../inc/MusicNotation.js";

	import SvgPianoRoll from "../components/svg-piano-roll.vue";



	export default {
		name: "midi-roll",


		props: {
			midiURL: String,
			player: Object,
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

				return `-3 ${-high - 1} ${this.notations.endTime * this.timeScale + 4} ${high - low + 5}`;
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


			progressTime () {
				return this.player ? this.player.progressTime : null;
			},
		},


		created () {
			this.load();
		},


		methods: {
			async load () {
				this.notations = null;

				if (this.player) {
					this.notations = this.player.notations;

					this.updateNoteStatus();
					this.$forceUpdate();
				}
				else if (this.midiURL) {
					const buffer = await (await fetch(this.midiURL)).arrayBuffer();
					const midi = parseMidiData(buffer);

					this.notations = Notation.parseMidi(midi);
					//console.log("notations:", this.notations);
				}
			},


			updateNoteStatus () {
				if (!this.notations)
					return;

				const valid = Number.isFinite(this.progressTime);
				for (const note of this.notations.notes)
					Vue.set(note, "on", valid && (note.start < this.progressTime) && (note.start + note.duration > this.progressTime));
			},
		},


		watch: {
			midiURL: "load",
			player: "load",


			progressTime: "updateNoteStatus",
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
		font-size: 2px;
		text-anchor: middle;
		user-select: none;
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

	.progress rect
	{
		fill: #afa1;
	}

	.progress line
	{
		stroke: #0a0;
		stroke-width: 0.04;
	}
</style>
