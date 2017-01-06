import Phaser from 'phaser';
import {randomCar as randomCarSprite} from '../assets/cars';
import config from './config';

const splitValByAngle = (val, angle) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	return new Phaser.Point(val * sin, -val * cos);
};

export default class Car extends Phaser.Sprite {
	constructor(game, x = -100, y = -100) {
		super(game, x, y, randomCarSprite());
		game.physics.arcade.enable(this);
		this.anchor.setTo(0.5, 0.5);
		this.width = config.CAR_SIZE;
		this.height = config.CAR_SIZE;
		this.states = {};
		return this;
	}
	getVelocity() {
		return Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2));
	}
	setVelocity(val) {
		const values = splitValByAngle(val, this.rotation);
		this.body.velocity = Object.assign(this.body.velocity, values);
		const max = splitValByAngle(config.CAR_MAXSPEED, this.rotation);
		// max velcoity needs to be absolute
		this.body.maxVelocity = new Phaser.Point(Math.abs(max.x), Math.abs(max.y));
		return this;
	}
	setAcceleration(val) {
		const values = splitValByAngle(val, this.rotation);
		this.body.acceleration = Object.assign(this.body.acceleration, values);
		return this;
	}
	getAcceleration() {
		return Math.sqrt(Math.pow(this.body.acceleration.x, 2) + Math.pow(this.body.acceleration.y, 2));
	}
	rotateTo(val) {
		this.rotation = val;
		// update velocity vectors
		this.setVelocity(this.getVelocity());
		this.setAcceleration(this.getAcceleration());
		return this;
	}
	setStreet(street, pct = 0) {
		const pos = street.getPositionAt(pct);
		this.x = pos.x;
		this.y = pos.y;
		this.rotateTo(pos.heading);
		this.street = street;
		return this;
	}
	getTravelDirection() {
		const diff = this.rotation - this.street.orientation;
		const dir = Math.round((Math.abs(diff) / Math.PI)) % 2 === 0;
		return dir;
	}
	checkTurn() {
		const car = this;
		const distance = car.street.getCovered(car, !car.getTravelDirection()).toFixed(3);
		if (distance >= 1 && !car.states.turning) {
			car.states.turning = true;
			setTimeout(() => {
				car.states.turning = false;
			}, 10);
			const pos = car.street.getCovered(car) > 0.5 ? 'end' : 'start';
			const nextStreet = car.street.getNeighbor(pos);
			if (nextStreet) {
				// determine if car should be placed at start/end of segments
				const atStart = nextStreet.start.distance(car) < nextStreet.end.distance(car);
				car.setStreet(nextStreet, atStart ? 0 : 1);
			} else {
				car.rotateTo(car.rotation + Math.PI);
			}
		}
	}
}
