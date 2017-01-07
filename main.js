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
		// init the world with 3 cars
		for (let i = 3; i > 0; i--) {
			this.carManager.addCar();
		}
	}

	update() {
		this.carManager.update();
	}
}

// Add the 'mainState' and call it 'main'
game.state.add('main', MainState);

// Start the state to actually start the game
game.state.start('main');
