
//import "./utils.mjs";



//const DEFAULT_TICKS_PER_BEATS = 480;

const PedalControllerTypes = {
	64: "Sustain",
	65: "Portamento",
	66: "Sostenuto",
	67: "Soft",
};



const midiToEvents = (midiFile, timeWarp) => {
	const trackStates = [];
	let beatsPerMinute = 120;
	const ticksPerBeat = midiFile.header.ticksPerBeat;

	for (let i = 0; i < midiFile.tracks.length; i++) {
		trackStates[i] = {
			nextEventIndex: 0,
			ticksToNextEvent: (
				midiFile.tracks[i].length ?
					midiFile.tracks[i][0].deltaTime :
					null
			),
		};
	}

	function getNextEvent() {
		let ticksToNextEvent = null;
		let nextEventTrack = null;
		let nextEventIndex = null;

		for (var i = 0; i < trackStates.length; i++) {
			if (
				trackStates[i].ticksToNextEvent != null
				&& (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
			) {
				ticksToNextEvent = trackStates[i].ticksToNextEvent;
				nextEventTrack = i;
				nextEventIndex = trackStates[i].nextEventIndex;
			}
		}
		if (nextEventTrack != null) {
			/* consume event from that track */
			var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
			if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
				trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
			} else {
				trackStates[nextEventTrack].ticksToNextEvent = null;
			}
			trackStates[nextEventTrack].nextEventIndex += 1;
			/* advance timings on all tracks by ticksToNextEvent */
			for (var i = 0; i < trackStates.length; i++) {
				if (trackStates[i].ticksToNextEvent != null) {
					trackStates[i].ticksToNextEvent -= ticksToNextEvent
				}
			}
			return {
				"ticksToEvent": ticksToNextEvent,
				"event": nextEvent,
				"track": nextEventTrack
			}
		} else {
			return null;
		}
	};
	//
	let midiEvent;
	const events = [];
	//
	function processEvents() {
		function processNext() {
			if ( midiEvent.event.type == "meta" && midiEvent.event.subtype == "setTempo" ) {
				// tempo change events can occur anywhere in the middle and affect events that follow
				beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat;
			}
			let secondsToGenerate = 0;
			if (midiEvent.ticksToEvent > 0) {
				const beatsToGenerate = midiEvent.ticksToEvent / ticksPerBeat;
				secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60);
			}
			const time = (secondsToGenerate * 1000 * timeWarp) || 0;
			events.push([ midiEvent, time ]);
			midiEvent = getNextEvent();
		};
		//
		if (midiEvent = getNextEvent()) {
			while (midiEvent)
				processNext(true);
		}
	};

	processEvents();

	return events;
};



export class Notation {
	static parseMidi(data) {
		const channelStatus = [];
		const pedalStatus = {};
		const pedals = {};
		const channels = [];
		const bars = [];
		let time = 0;
		let millisecondsPerBeat = 600000 / 120;
		let beats = 0;
		let numerator = 4;
		let barIndex = 0;
		const keyRange = {};
		let rawTicks = 0;
		let ticks = 0;
		let correspondences;
		const tempos = [];

		const ticksPerBeat = data.header.ticksPerBeat;

		const rawEvents = midiToEvents(data);

		const events = rawEvents.map(d => ({
			data: d[0].event,
			track: d[0].track,
			deltaTime: d[1],
			deltaTicks: d[0].ticksToEvent,
		}));

		let index = 0;

		const ticksNormal = 1;

		for (const ev of events) {
			rawTicks += ev.deltaTicks;
			ticks = Math.round(rawTicks * ticksNormal);
			beats = ticks / ticksPerBeat;

			if (ev.deltaTime > 0) {
				let deltaBeats = ev.deltaTime / millisecondsPerBeat;
				for (let b = Math.ceil(beats) ; b < beats + deltaBeats; ++b) {
					let t = time + (b - beats) * millisecondsPerBeat;
					bars.push({ time: t, index: barIndex % numerator });

					++barIndex;
				}
			}

			time += ev.deltaTime;

			//const ticksTime = beats * millisecondsPerBeat;
			//console.log("time:", time, ticksTime, ticksTime - time);

			ev.time = time;
			ev.ticks = ticks;

			const event = ev.data;
			switch (event.type) {
				case "channel":
					//channelStatus[event.channel] = channelStatus[event.channel] || [];

					switch (event.subtype) {
						case "noteOn":
							{
								const pitch = event.noteNumber;
								//channelStatus[event.channel][pitch] = {
								channelStatus.push({
									channel: event.channel,
									pitch,
									startTick: ticks,
									start: time,
									velocity: event.velocity,
									beats: beats,
									track: ev.track,
								});

								keyRange.low = Math.min(keyRange.low || pitch, pitch);

								ev.index = index;
								++index;
							}

							break;
						case "noteOff":
							{
								const pitch = event.noteNumber;

								channels[event.channel] = channels[event.channel] || [];

								const statusIndex = channelStatus.findIndex(status => status.channel == event.channel && status.pitch == pitch);
								if (statusIndex >= 0) {
									const status = channelStatus.splice(statusIndex, 1)[0];

									channels[event.channel].push({
										startTick: status.startTick,
										endTick: ticks,
										pitch,
										start: status.start,
										duration: time - status.start,
										velocity: status.velocity,
										beats: status.beats,
										track: status.track,
										finger: status.finger,
									});
								}
								else
									console.warn("unexpected noteOff: ", time, event);

								keyRange.high = Math.max(keyRange.high || pitch, pitch);
							}

							break;
						case "controller":
							switch (event.controllerType) {
								// pedal controllers
								case 64:
								case 65:
								case 66:
								case 67:
									const pedalType = PedalControllerTypes[event.controllerType];

									pedalStatus[event.channel] = pedalStatus[event.channel] || {};
									pedals[event.channel] = pedals[event.channel] || [];

									const status = pedalStatus[event.channel][pedalType];

									if (event.value > 0) {
										if (!status)
											pedalStatus[event.channel][pedalType] = { start: time, value: event.value };
									}
									else {
										if (status) {
											pedals[event.channel].push({ type: pedalType, start: status.start, duration: time - status.start, value: status.value });

											pedalStatus[event.channel][pedalType] = null;
										}
									}

									break;
							}

							break;
					}

					break;
				case "meta":
					switch (event.subtype) {
						case "setTempo":
							millisecondsPerBeat = event.microsecondsPerBeat / 1000;
							//beats = Math.round(beats);
							tempos.push({tempo: event.microsecondsPerBeat, ticks, time});

							break;
						case "timeSignature":
							numerator = event.numerator;
							barIndex = 0;

							break;
						case "text":
							if (!correspondences && /^find-corres:/.test(event.text)) {
								const captures = event.text.match(/:([\d\,-]+)/);
								const str = captures && captures[1] || "";
								correspondences = str.split(",").map(s => Number(s));
							}
							else if (/fingering\(.*\)/.test(event.text)) {
								const [_, fingers] = event.text.match(/\((.+)\)/);
								const finger = Number(fingers);
								if (!Number.isNaN(finger)) {
									const status = channelStatus[channelStatus.length - 1];
									if (status)
										status.finger = finger;

									const event = events.find(e => e.index == index - 1);
									if (event)
										event.data.finger = finger;
								}
							}

							break;
						case "copyrightNotice":
							console.log("MIDI copyright:", event.text);

							break;
					}

					break;
			}
		}

		channelStatus.forEach(status => {
			console.warn("unclosed noteOn event at", status.startTick, status);

			channels[status.channel].push({
				startTick: status.startTick,
				endTick: ticks,
				pitch: status.pitch,
				start: status.start,
				duration: time - status.start,
				velocity: status.velocity,
				beats: status.beats,
				track: status.track,
				finger: status.finger,
			});
		});

		return new Notation({
			channels,
			keyRange,
			pedals,
			bars,
			endTime: time,
			endTick: ticks,
			correspondences,
			events,
			tempos,
			ticksPerBeat,
			meta: {},
		});
	}


	constructor(fields) {
		Object.assign(this, fields);

		// channels to notes
		this.notes = [];
		for (const channel of this.channels)
			if (channel)
				for (const note of channel)
					this.notes.push(note);
		this.notes.sort(function (n1, n2) {
			return n1.start - n2.start;
		});

		for (const i in this.notes)
			this.notes[i].index = Number(i);


		// duration
		this.duration = this.notes.length > 0 ? (this.endTime - this.notes[0].start) : 0,

		//this.endSoftIndex = this.notes.length ? this.notes[this.notes.length - 1].softIndex : 0;


		// pitch map
		this.pitchMap = [];
		for (const c in this.channels) {
			for (const n in this.channels[c]) {
				const pitch = this.channels[c][n].pitch
				this.pitchMap[pitch] = this.pitchMap[pitch] || [];

				this.pitchMap[pitch].push(this.channels[c][n]);
			}
		}

		this.pitchMap.forEach(notes => notes.sort((n1, n2) => n1.start - n2.start));


		// setup measure notes index
		if (this.measures) {
			const measure_list = [];

			let last_measure = null;
			const measure_entries = Object.entries(this.measures).sort((e1, e2) => Number(e1[0]) - Number(e2[0]));
			for (const [t, measure] of measure_entries) {
				//console.log("measure time:", Number(t));
				measure.startTick = Number(t);
				measure.notes = [];

				if (last_measure)
					last_measure.endTick = measure.startTick;

				const m = measure.measure;
				measure_list[m] = measure_list[m] || [];
				measure_list[m].push(measure);

				last_measure = measure;
			}
			if (last_measure)
				last_measure.endTick = this.notes[this.notes.length - 1].endTick;
			for (const i in this.notes) {
				const note = this.notes[i];
				for (const t in this.measures) {
					const measure = this.measures[t];
					if (note.startTick >= measure.startTick && note.startTick < measure.endTick || note.endTick > measure.startTick && note.endTick <= measure.endTick)
						measure.notes.push(note);
				}
			}

			this.measure_list = measure_list;
		}


		// prepare beats info
		if (this.meta.beatInfos) {
			for (let i = 0; i < this.meta.beatInfos.length; ++i) {
				const info = this.meta.beatInfos[i];
				if (i > 0) {
					const lastInfo = this.meta.beatInfos[i - 1];
					info.beatIndex = lastInfo.beatIndex + Math.ceil((info.tick - lastInfo.tick) / this.ticksPerBeat);
				}
				else
					info.beatIndex = 0;
			}
		}


		// compute tempos tick -> time
		{
			let time = 0;
			let ticks = 0;
			let tempo = 500000;
			for (const entry of this.tempos) {
				const deltaTicks = entry.tick - ticks;
				time += (tempo / 1000) * deltaTicks / this.ticksPerBeat;

				ticks = entry.tick;
				tempo = entry.tempo;

				entry.time = time;
			}
		}
	}


	findChordBySoftindex(softIndex, radius = 0.8) {
		return this.notes.filter(note => Math.abs(note.softIndex - softIndex) < radius);
	}


	averageTempo(tickRange) {
		tickRange = tickRange || {from: 0, to: this.endtick};

		console.assert(this.tempos, "no tempos.");
		console.assert(tickRange.to > tickRange.from, "range is invalid:", tickRange);

		const span = index => {
			const from = Math.max(tickRange.from, this.tempos[index].tick);
			const to = (index < this.tempos.length - 1) ? Math.min(this.tempos[index + 1].tick, tickRange.to) : tickRange.to;

			return Math.max(0, to - from);
		};

		const tempo_sum = this.tempos.reduce((sum, tempo, index) => sum + tempo.tempo * span(index), 0);

		const average = tempo_sum / (tickRange.to - tickRange.from);

		// convert microseconds per beat to beats per minute
		return 60e+6 / average;
	}


	ticksToTime (ticks) {
		console.assert(Number.isFinite(ticks), "invalid ticks value:", ticks);
		console.assert(this.tempos && this.tempos.length, "no tempos.");

		let tempo_index = this.tempos.findIndex(tempo => tempo.tick > ticks) - 1;
		if (tempo_index < 0)
			tempo_index = this.tempos.length - 1;

		const tempo = this.tempos[tempo_index];

		return tempo.time + (ticks - tempo.tick) * tempo.tempo * 1e-3 / this.ticksPerBeat;
	}


	tickRangeToTimeRange (tickRange) {
		console.assert(tickRange.to >= tickRange.from, "invalid tick range:", tickRange);

		return {
			from: this.ticksToTime(tickRange.from),
			to: this.ticksToTime(tickRange.to),
		};
	}


	getMeasureRange (measureRange) {
		console.assert(Number.isInteger(measureRange.start) && Number.isInteger(measureRange.end), "invalid measure range:", measureRange);
		console.assert(this.measure_list && this.measure_list[measureRange.start] && this.measure_list[measureRange.end], "no measure data for specific index:", this.measure_list, measureRange);

		const startMeasure = this.measure_list[measureRange.start][0];
		let endMeasure = null;
		for (const measure of this.measure_list[measureRange.end]) {
			if (measure.endTick > startMeasure.startTick) {
				endMeasure = measure;
				break;
			}
		}

		// there no path between start measure and end measure.
		if (!endMeasure)
			return null;

		const tickRange = {from: startMeasure.startTick, to: endMeasure.endTick, duration: endMeasure.endTick - startMeasure.startTick};
		const timeRange = this.tickRangeToTimeRange(tickRange);
		timeRange.duration = timeRange.to - timeRange.from;

		return {
			tickRange,
			timeRange,
		};
	}
};
