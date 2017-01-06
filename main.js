/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/no-unassigned-import */
import 'pixi';
import 'p2';
/* eslint-enable */
import Phaser from 'phaser';
import config from './lib/config';
import CarManager from './lib/carmanager';
import {createMap} from './lib/street';
import {loadSprites as loadCars} from './assets/cars';

// Initialize Phaser
const game = new Phaser.Game(config.MAX_SIZE, config.MAX_SIZE);
global.game = game;

// Create our 'main' state that will contain the game
class MainState {
	preload() {
		loadCars(game);
		this.graphics = game.add.graphics(0, 0);
		this.carManager = new CarManager(game);
	}

	create() {
		game.stage.backgroundColor = '#ececec';
		game.physics.startSystem(Phaser.Physics.ARCADE);
		createMap(this.graphics);
		const spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.add(this.carManager.addCar.bind(this.carManager));
	}

	update() {
		const cars = this.carManager.cars.children;
		// check if the car should take a turn
		cars.forEach(car => car.checkTurn());
		// check for collision
		const group = this.carManager.cars;
		game.physics.arcade.overlap(group, group, (one, two) => {
			// only kill cars on same street
			// 	rectangle intersection might detect two cars on close by roads to overlap
			if (one.street.id === two.street.id) {
				// kill the one being hit
				two.kill();
			}
		});
	}
}

// Add the 'mainState' and call it 'main'
game.state.add('main', MainState);

// Start the state to actually start the game
game.state.start('main');
