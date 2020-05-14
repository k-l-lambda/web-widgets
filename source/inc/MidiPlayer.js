
const { Notation } = require("./MusicNotation.js");



//const msDelay = ms => new Promise(resolve => setTimeout(resolve, ms));
const animationDelay = () => new Promise(resolve => requestAnimationFrame(resolve));


class MidiPlayer {
	constructor (midiData, {cacheSpan = 600, onMidi, onPlayFinish, onTurnCursor} = {}) {
		this.cacheSpan = cacheSpan;
		this.onMidi = onMidi;
		this.onPlayFinish = onPlayFinish;
		this.onTurnCursor = onTurnCursor;

		let notations;
		if (midiData.notes && midiData.endTime)
			notations = midiData;
		else
			notations = Notation.parseMidi(midiData);

		this.notations = notations;
		this.events = notations.events;
		//console.log("events:", this.events);

		this.isPlaying = false;
		this.progressTime = 0;
		this.startTime = performance.now();
		this.duration = notations.endTime;
		this.cursorTurnDelta = 0;
	}


	dispose () {
		this.isPlaying = false;
		this.progressTime = 0;
	}


	get progressTicks () {
		return this.notations.timeToTicks(this.progressTime);
	}


	set progressTicks (value) {
		this.progressTime = this.notations.ticksToTime(value);
	}


	async play () {
		if (this.progressTime >= this.duration)
			this.progressTime = 0;

		let now = performance.now();
		this.startTime = now - this.progressTime;

		this.isPlaying = true;

		let currentEventIndex = this.events.findIndex(event => event.time >= now - this.startTime);

		while (this.isPlaying) {
			for (; currentEventIndex < this.events.length; ++currentEventIndex) {
				const event = this.events[currentEventIndex];
				//console.log("play event:", currentEventIndex, event.time, this.progressTime + this.cacheSpan);
				if (!event || event.time > this.progressTime + this.cacheSpan)
					break;

				if (event.data.type === "channel" && this.startTime + event.time >= now)
					if (this.onMidi)
						this.onMidi(event.data, this.startTime + event.time);
			}

			//await msDelay(this.cacheSpan * 0.1);
			await animationDelay();

			if (!this.isPlaying)
				break;

			if (this.cursorTurnDelta !== 0) {
				const backturn = this.cursorTurnDelta < 0;

				this.startTime -= this.cursorTurnDelta;
				this.cursorTurnDelta = 0;

				if (backturn) {
					for (; currentEventIndex > 0; --currentEventIndex) {
						const eventTime = this.events[currentEventIndex].time;
						if (this.startTime + eventTime < now)
							break;
					}
				}
			}

			now = performance.now();

			this.progressTime = now - this.startTime;

			if (this.progressTime > this.duration) {
				this.isPlaying = false;

				if (this.onPlayFinish)
					this.onPlayFinish();
			}
		}
	}


	pause () {
		this.isPlaying = false;
	}


	turnCursor (time) {
		//console.log("onTurnCursor:", time, oldTime);
		if (this.isPlaying)
			this.cursorTurnDelta += time - this.progressTime;
		else
			this.progressTime = time;

		if (this.onTurnCursor)
			this.onTurnCursor(time);
	}
};



module.exports = MidiPlayer;
