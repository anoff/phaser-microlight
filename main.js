/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/no-unassigned-import */
import 'pixi';
import 'p2';
/* eslint-enable */
import Phaser from 'phaser';
import config from './lib/config';
import * as street from './lib/street';
import Car from './lib/car';

// Initialize Phaser
const game = new Phaser.Game(config.MAX_SIZE, config.MAX_SIZE);

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
		game.stage.backgroundColor = '#ececec';
		game.physics.startSystem(Phaser.Physics.ARCADE);

		this.street = game.add.graphics(0, 0);
		street.createStreet(this.street);

		const newPos = street.randomPos();
		const newCar = new Car(game, newPos.x, newPos.y);
		newCar.rotateTo(newPos.heading);
		newCar.setVelocity(20);
		game.add.existing(newCar);
		const spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.add(() => {
			const newPos = street.randomPos();
			newCar.x = newPos.x;
			newCar.y = newPos.y;
			newCar.rotateTo(newPos.heading);
		});
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
