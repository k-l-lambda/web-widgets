
const trackDeltaToAbs = events => {
	let tick = 0;

	events.forEach(event => {
		tick += event.deltaTime;
		event.tick = tick;
	});
};


const trackAbsToDelta = events => {
	let lastTick = 0;

	events.sort((e1, e2) => e1.tick - e2.tick).forEach(event => {
		event.deltaTime = event.tick - lastTick;
		lastTick = event.tick;
	});
};


const sliceTrack = (track, startTick, endTick) => {
	trackDeltaToAbs(track);

	const events = [];
	const status = {};

	track.forEach(event => {
		if (event.tick >= startTick && event.tick <= endTick && event.subtype !== "endOfTrack")
			events.push({
				...event,
				tick: event.tick - startTick,
			});
		else if (event.tick < startTick) {
			switch (event.type) {
			case "meta":
				status[event.subtype] = event;

				break;
			}
		}
	});

	Object.values(status).forEach(event => events.push({
		...event,
		tick: 0,
	}));

	events.push({
		tick: endTick - startTick,
		type: "meta",
		subtype: "endOfTrack",
	});

	trackAbsToDelta(events);

	return events;
};


const sliceMidi = (midi, startTick, endTick) => ({
	header: midi.header,
	tracks: midi.tracks.map(track => sliceTrack(track, startTick, endTick)),
});



module.exports = {
	sliceMidi,
};
