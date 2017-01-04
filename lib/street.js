import config from './config';

let intersections = [
  // 100 is max (autoscaled)
  [0, 0],
  [10, 30],
  [50, 30],
  [26, 76],
  [90, 85],
  [70, 50],
  [66, 10]
];
intersections = intersections.map(elm => {
	return [
		elm[0] / 100 * config.MAX_SIZE, elm[1] / 100 * config.MAX_SIZE
	];
});
const segments = [
  // connect intersections (index)
  [0, 1],
  [1, 2],
  [1, 4],
  [2, 3],
  [1, 3],
  [3, 5],
/*  [2, 6],
  [3, 4],
  [4, 6],
  [6, 5],
  [2, 5],
  [5, 6],*/
  [4, 6]
];

function createStreet(graphics) {
	segments.forEach(elm => {
		const start = intersections[elm[0]];
		const end = intersections[elm[1]];
		// main road
		graphics.lineStyle(config.STREET_WIDTH, 0x666666, 1);
		graphics.moveTo(start[0], start[1]);
		graphics.lineTo(end[0], end[1]);
		// helper lines
		graphics.lineStyle(2, 0xff00ff, 0.5);
		graphics.moveTo(start[0], start[1]);
		graphics.lineTo(start[0], end[1]);
		graphics.moveTo(start[0], start[1]);
		graphics.lineTo(end[0], start[1]);
	});
	intersections.forEach(elm => {
		graphics.lineStyle(config.STREET_WIDTH, 0x666666, 1);
		graphics.drawCircle(elm[0], elm[1], config.STREET_WIDTH);
	});
}

function randomPos() {
	const segment = segments[Math.floor(Math.random() * segments.length)];
	const start = intersections[segment[0]];
	const end = intersections[segment[1]];
	const x = end[0] - start[0];
	const y = end[1] - start[1];

	const xD = Math.random() * x;
	const yD = y * xD / x;
	let heading = Math.atan2(y, x) + (Math.PI / 2);
	// turn car around, to face long side of street
	if (xD / x > 0.5) {
		heading += Math.PI;
	}
	return {
		x: start[0] + xD,
		y: start[1] + yD,
		heading
	};
}

export {randomPos, createStreet};
