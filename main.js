/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/no-unassigned-import */
import 'pixi';
import 'p2';
/* eslint-enable */
import Phaser from 'phaser';
import config from './lib/config';
import CarManager from './lib/carmanager';
import {createMap} from './lib/street';

// Initialize Phaser
const game = new Phaser.Game(config.MAX_SIZE, config.MAX_SIZE);
global.game = game;

// Create our 'main' state that will contain the game
class MainState {
	preload() {
		game.load.image('car', 'assets/Car.png');
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
		this.carManager.cars.children.forEach(car => car.checkTurn());
	}
}

// Add the 'mainState' and call it 'main'
game.state.add('main', MainState);

// Start the state to actually start the game
game.state.start('main');
