import isOpposedAngle from 'is-opposed-angle';
import {streets} from './street';
import Car from './car';
import config from './config';

export default class CarManager {
	constructor(game) {
		this.game = game;
		this.cars = game.add.group();
	}

	addCar(velocity, street = streets[Math.floor(Math.random() * streets.length)], position = Math.random()) {
		const car = new Car(this.game);
		car.setStreet(street, position);
		car.setAcceleration(config.CAR_ACCELERATION);
		this.game.add.existing(car);
		this.cars.add(car);
	}

	update() {
		const cars = this.cars.children;
		// check if the car should take a turn
		cars.forEach(car => car.limitVelocity().checkTurn());
		// check for collision
		const PhysGroup = this.cars;
		this.game.physics.arcade.overlap(PhysGroup, PhysGroup, (one, two) => {
			// only kill cars on same street
			// 	rectangle intersection might detect two cars on close by roads to overlap
			if (one.street.id === two.street.id) {
				if (!isOpposedAngle(one.rotation, two.rotation)) {
					one.kill();
					console.log('collision');
				}
			}
		});
	}
}
