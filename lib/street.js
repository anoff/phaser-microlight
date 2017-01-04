/* global game */
import Phaser from 'phaser';
import config from './config';

let intersections = [
  // 100 is max (autoscaled)
  [5, 5],
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
  [2, 3],
	[2, 5],
  [1, 3],
  [3, 5],
	[0, 6],
	[2, 6],
  [4, 6]
];
const streets = [];

class Street {
	constructor(start, end) {
		this.start = new Phaser.Point(start[0], start[1]);
		this.end = new Phaser.Point(end[0], end[1]);
		this.deltaX = this.end.x - this.start.x;
		this.deltaY = this.end.y - this.start.y;
		this.length = this.start.distance(this.end);
		this.orientation = Math.atan2(this.deltaY, this.deltaX) + (Math.PI / 2);
	}

	draw(graphics) {
		graphics.lineStyle(config.STREET_WIDTH, 0x666666, 1);
		graphics.moveTo(this.start.x, this.start.y);
		graphics.lineTo(this.end.x, this.end.y);

		if (config.DEBUG) {
			// helper lines
			graphics.lineStyle(2, 0xff00ff, 0.5);
			graphics.moveTo(this.start.x, this.start.y);
			graphics.lineTo(this.start.x, this.end.y);
			graphics.moveTo(this.start.x, this.start.y);
			graphics.lineTo(this.end.x, this.start.y);
		}
	}

	drawIntersections(graphics) {
		graphics.lineStyle(config.STREET_WIDTH, 0x666666, 1);
		graphics.drawCircle(this.start.x, this.start.y, config.STREET_WIDTH);
		graphics.drawCircle(this.end.x, this.end.y, config.STREET_WIDTH);
	}

	getPositionAt(pct = Math.random()) {
		const xD = pct * this.deltaX;
		const yD = pct * this.deltaY;
		let heading = this.orientation;
		if (pct > 0.5) {
			heading += Math.PI;
		}
		return {
			x: this.start.x + xD,
			y: this.start.y + yD,
			heading
		};
	}
}

function createMap(graphics) {
	segments.forEach((elm, ix) => {
		const start = intersections[elm[0]];
		const end = intersections[elm[1]];
		const street = new Street(start, end);
		street.draw(graphics);
		street.drawIntersections(graphics);
		streets.push(street);

		// draw numbers on street
		const pos = street.getPositionAt(0.13);
		const text = game.add.text(pos.x, pos.y, ix.toString(), {align: 'center', fill: '#ff00ff', fontSize: '14px', backgroundColor: '#fff'});
		text.anchor.set(0.5);
	});
}

export {Street as default, createMap, streets};
