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
}
