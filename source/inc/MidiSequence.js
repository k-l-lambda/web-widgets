
const midiToSequence = (midiFile, timeWarp = 1) => {
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

	function getNextEvent () {
		let ticksToNextEvent = null;
		let nextEventTrack = null;
		let nextEventIndex = null;

		for (let i = 0; i < trackStates.length; i++) {
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
			const nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
			if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) 
				trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
			else 
				trackStates[nextEventTrack].ticksToNextEvent = null;

			trackStates[nextEventTrack].nextEventIndex += 1;
			/* advance timings on all tracks by ticksToNextEvent */
			for (let i = 0; i < trackStates.length; i++) {
				if (trackStates[i].ticksToNextEvent != null) 
					trackStates[i].ticksToNextEvent -= ticksToNextEvent;
			}
			return {
				ticksToEvent: ticksToNextEvent,
				event: nextEvent,
				track: nextEventTrack,
			};
		}
		else 
			return null;
		
	};
	//
	let midiEvent;
	const events = [];
	//
	function processEvents () {
		function processNext () {
			if ( midiEvent.event.type == "meta" && midiEvent.event.subtype == "setTempo" ) {
				// tempo change events can occur anywhere in the middle and affect events that follow
				beatsPerMinute = 60e+6 / midiEvent.event.microsecondsPerBeat;
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
				processNext();
		}
	};

	processEvents();

	return events;
};



module.exports = {
	midiToSequence,
};
