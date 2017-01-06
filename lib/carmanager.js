import {streets} from './street';
import Car from './car';

export default class CarManager {
	constructor(game) {
		this.game = game;
		this.cars = game.add.group();
	}

	addCar(velocity, street = streets[Math.floor(Math.random() * streets.length)], position = Math.random()) {
		const car = new Car(this.game);
		car.setStreet(street, position);
		car.setVelocity(200);
		this.game.add.existing(car);
		this.cars.add(car);
	}
}
