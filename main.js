/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/no-unassigned-import */
import 'pixi';
import 'p2';
/* eslint-enable */
import Phaser from 'phaser';
import config from './lib/config';
import Car from './lib/car';
import {createMap, streets} from './lib/street';

// Initialize Phaser
const game = new Phaser.Game(config.MAX_SIZE, config.MAX_SIZE);
global.game = game;

// Create our 'main' state that will contain the game
class MainState {
	preload() {
		game.load.image('car', 'assets/Car.png');
		this.cars = game.add.group();
		this.graphics = game.add.graphics(0, 0);
	}

	create() {
		game.stage.backgroundColor = '#ececec';
		game.physics.startSystem(Phaser.Physics.ARCADE);
		createMap(this.graphics);
		this.car = new Car(game);
		game.add.existing(this.car);
		this.replaceCar = () => {
			const street = streets[Math.floor(Math.random() * streets.length)];
			this.car.setStreet(street);
		};
		this.replaceCar();
		this.car.setVelocity(20);
		const spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.add(this.replaceCar);
	}

	update() {
		const distance = this.car.street.end.distance(this.car);
		if (distance <= 5) {
			this.replaceCar();
		}
	}
}

// Add the 'mainState' and call it 'main'
game.state.add('main', MainState);

// Start the state to actually start the game
game.state.start('main');
