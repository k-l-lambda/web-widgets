<template>
	<svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="height" @click="onClickCanvas">
		<g :transform="`translate(${-xScroll}, 0)`">
			<g v-if="progressTime" class="progress">
				<rect :x="0" :y="-120" :height="121 - notations.keyRange.low" :width="progressTime * timeScale" />
				<line :x1="progressTime * timeScale" :x2="progressTime * timeScale" :y1="-notations.keyRange.low + 1" y2="-120" />
			</g>
			<g v-if="notations">
				<g class="bar" v-for="(bar, i) of notations.bars" :key="i">
					<line v-if="bar.index === 0"
						:x1="bar.time * timeScale" :x2="bar.time * timeScale" :y1="-notations.keyRange.low + 1" y2="-120"
					/>
				</g>
			</g>
			<SvgPianoRoll v-if="notations" :notations="notations" :timeScale="timeScale" />
		</g>
		<g class="scales" v-if="notations">
			<rect class="pitch-padding" :x="-10" :y="-120" :width="10" :height="-notations.keyRange.low + 121" />
			<line x1="0" x2="0" :y1="-notations.keyRange.low + 1" y2="-120" />
			<line x1="0" :x2="timeScale * notations.endTime - xScroll" :y1="-notations.keyRange.low + 1" :y2="-notations.keyRange.low + 1" />
			<g class="pitch-bar" v-for="pitch of pitchScales" :key="`p-${pitch}`">
				<line x1="-.8" x2="0" :y1="-pitch + 0.5" :y2="-pitch + 0.5" />
				<text x="-2" :y="-pitch + 1" >{{pitch}}</text>
			</g>
			<g :transform="`translate(${-xScroll}, 0)`">
				<g class="time-bar" v-for="time of timeScales" :key="`t-${time}`">
					<line :x1="time * timeScale" :x2="time * timeScale" :y1="-notations.keyRange.low + 1" :y2="-notations.keyRange.low + 1.8" />
					<text :x="time * timeScale" :y="-notations.keyRange.low + 4">{{time * 1e-3}}s</text>
				</g>
			</g>
		</g>
	</svg>	
</template>

<script>
	import Vue from "vue";

	import { parseMidiData } from "../inc/MIDI";
	import { Notation } from "../inc/MusicNotation.js";

	import SvgPianoRoll from "../components/svg-piano-roll.vue";



	const PADDINGS = {
		left: 3,
		right: 1,
	};



	export default {
		name: "midi-roll",


		props: {
			midiURL: String,
			player: Object,
			height: {
				type: Number,
				default: 200,
			},
			width: Number,
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
				timeScroll: 0,
			};
		},


		computed: {
			widthLimited () {
				return Number.isFinite(this.width);
			},


			aspectRatio () {
				return this.widthLimited ? this.width / this.height : 1.6;
			},


			viewHeight () {
				if (this.notations) {
					const {low, high} = this.notations.keyRange;

					return high - low + 5;
				}

				return 90;
			},


			viewWidth () {
				const duration = this.notations ? this.notations.endTime : this.height * this.aspectRatio;
				const justifyWidth = duration * this.timeScale + PADDINGS.left + PADDINGS.right;

				if (this.widthLimited)
					return Math.min(justifyWidth, this.width * this.viewHeight / this.height);

				return justifyWidth;
			},


			viewBox () {
				return `-${PADDINGS.left} ${this.notations ? -this.notations.keyRange.high - 1 : 0} ${this.viewWidth} ${this.viewHeight}`;
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


			visibleTimeSpan () {
				if (this.widthLimited)
					return (this.viewWidth - (PADDINGS.left + PADDINGS.right)) / this.timeScale;

				return Infinity;
			},


			xScroll () {
				return this.timeScroll * this.timeScale;
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


			onClickCanvas (event) {
				//console.log("click:", event.offsetX, event.offsetY);

				if (this.player) {
					const docToCanvas = (this.notations.keyRange.high - this.notations.keyRange.low + 5) / this.height;
					const x = event.offsetX * docToCanvas - PADDINGS.left + this.xScroll;
					const time = x / this.timeScale;

					if (time >= 0 && time < this.notations.endTime)
						this.player.turnCursor(time);
				}
			},


			adjustTimeScroll () {
				if (this.progressTime - this.timeScroll > this.visibleTimeSpan * 0.6)
					this.timeScroll = Math.min(this.progressTime - this.visibleTimeSpan * 0.6, this.notations.endTime - this.visibleTimeSpan);
				else if (this.progressTime - this.timeScroll < this.visibleTimeSpan * 0.4)
					this.timeScroll = Math.max(this.progressTime - this.visibleTimeSpan * 0.4, 0);
			},
		},


		watch: {
			midiURL: "load",
			player: "load",


			progressTime () {
				this.updateNoteStatus();

				if (this.widthLimited)
					this.adjustTimeScroll();
			},
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

	.pitch-padding
	{
		fill: #fffc;
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
