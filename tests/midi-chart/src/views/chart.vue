<template>
	<div>
		<table>
			<tbody>
				<tr v-for="item of stateSequence" :key="item.ticks">
					<th>
						{{ item.ticks }}
					</th>
					<td class="events">
						<ul>
							<li v-for="(event, i) of item.events" :key="i">
								{{ event }}
							</li>
						</ul>
					</td>
					<td class="pitches">
						<span v-for="(pitch, p) of item.pitchStatus" :key="p">
							<label v-for="(count, channel) of pitch" :key="channel" v-if="count" :data-channel="channel" :data-intensity="count" />
						</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	import { MIDI } from "@k-l-lambda/web-widgets";
	import * as MidiSequence from "@k-l-lambda/web-widgets/source/inc/MidiSequence";



	const eventSummary = event => {
		switch (event.subtype) {
		case "noteOn":
			return `on: ${event.channel}, ${event.noteNumber}`;

		case "noteOff":
			return `off: ${event.channel}, ${event.noteNumber}`;

		case "setTempo":
			return `tempo: ${event.microsecondsPerBeat / 1000}`;

		case "controller":
			return `controller: ${event.controllerType}`;

		case "programChange":
			return `program: ${event.programNumber}`;

		default:
			return `${event.type}|${event.subtype}`;
		}
	};



	export default {
		name: "midi-chart",


		props: {
			midiURL: String,
		},


		data () {
			return {
				stateSequence: [],
			};
		},


		created () {
			window.$main = this;

			this.load();
		},


		methods: {
			async load () {
				console.debug("loading...");

				this.stateSequence = [];

				if (!this.midiURL)
					return;

				const buffer = await (await fetch(this.midiURL)).arrayBuffer();
				const midi = MIDI.parseMidiData(buffer);
				//console.log("midi:", midi);

				const events = MidiSequence.midiToSequence(midi);
				//console.log("events:", events);

				let ticks = 0;
				const pitchStatus = Array(108).fill().map(() => Array(16).fill(0));

				const initialSeq = ticks => ({ ticks, events: [] });

				let currentSeq = initialSeq(ticks);
				this.stateSequence.push(currentSeq);

				events.forEach(([{ ticksToEvent, event }]) => {
					if (ticksToEvent) {
						currentSeq.pitchStatus = JSON.parse(JSON.stringify(pitchStatus));

						ticks += ticksToEvent;
						currentSeq = initialSeq(ticks);
						this.stateSequence.push(currentSeq);
					}

					currentSeq.events.push(eventSummary(event));

					switch (event.subtype) {
					case "noteOn":
						++pitchStatus[event.noteNumber][event.channel];

						break;
					case "noteOff":
						--pitchStatus[event.noteNumber][event.channel];

						break;
					}
				});

				console.debug("done");
			},
		},


		watch: {
			midiURL: "load",
		},
	};
</script>

<style scoped>
	table
	{
		height: 1px;
	}

	tr
	{
		position: relative;
	}

	td.events
	{
		font-size: 9px;
	}

	td.pitches > span
	{
		display: inline-block;
		width: 10px;
		height: 100%;
		position: relative;
	}

	td.pitches > span label
	{
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	label[data-intensity="1"]
	{
		opacity: 0.5;
	}

	label[data-channel="0"]
	{
		background-color: green;
	}

	label[data-channel="1"]
	{
		background-color: blue;
	}

	label[data-channel="2"]
	{
		background-color: yellow;
	}

	label[data-channel="3"]
	{
		background-color: pink;
	}
</style>
