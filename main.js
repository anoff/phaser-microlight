/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/no-unassigned-import */
import 'pixi';
import 'p2';
/* eslint-enable */
import Phaser from 'phaser';

const MAX_SIZE = 600;
const STREET_WIDTH = 10;

// Initialize Phaser
const game = new Phaser.Game(MAX_SIZE, MAX_SIZE);

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
		elm[0] / 100 * MAX_SIZE, elm[1] / 100 * MAX_SIZE
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
  [2, 6],
  [3, 4],
  [4, 6],
  [6, 5],
  [2, 5],
  [5, 6],
  [4, 6]
];
function createStreet(graphics) {
	graphics.lineStyle(STREET_WIDTH, 0xffd900, 1);
	segments.forEach(elm => {
		const start = intersections[elm[0]];
		const end = intersections[elm[1]];
		graphics.moveTo(start[0], start[1]);
		graphics.lineTo(end[0], end[1]);
	});
	intersections.forEach(elm => {
		graphics.drawCircle(elm[0], elm[1], STREET_WIDTH);
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
	let heading = (Math.atan2(y, x) + Math.PI) / 2;
	if (xD / x > 0.5) {
		heading += Math.PI;
	}
	return {
		x: start[0] + xD,
		y: start[1] + yD,
		heading
	};
}

// Create our 'main' state that will contain the game
class MainState {
	constructor() {
		this.carSize = 40;
	}

	preload() {
		game.load.image('car', 'assets/Car.png');
		this.cars = game.add.group();
	}

	create() {
		game.stage.backgroundColor = '#a470ff';
		game.physics.startSystem(Phaser.Physics.ARCADE);

		this.street = game.add.graphics(0, 0);
		createStreet(this.street);

		const newPos = randomPos();
		const newCar = game.add.sprite(newPos.x, newPos.y, 'car');
		newCar.anchor.setTo(0.5, 0.5);
		newCar.width = this.carSize;
		newCar.height = this.carSize;

		newCar.rotation = newPos.heading;

		game.physics.arcade.enable(newCar);
		const VEL = 20;

    // TODO fix velocity orientation
		newCar.body.velocity.y = -VEL / Math.sin(newCar.rotation);
		newCar.body.velocity.x = VEL / Math.cos(newCar.rotation);
		console.log(newCar);
	}

	update() {
    // This function is called 60 times per second
    // It contains the game's logic
	}
}

// Add the 'mainState' and call it 'main'
game.state.add('main', MainState);

// Start the state to actually start the game
game.state.start('main');
