import Phaser from 'phaser';
import isOpposedAngle from 'is-opposed-angle';
import {randomCar as randomCarSprite} from '../assets/cars';
import config from './config';

const splitValByAngle = (val, angle) => {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	return new Phaser.Point(val * sin, -val * cos);
};
let states = ['INIT', 'ACCELERATING', 'DECELERATING', 'TURNING', 'DRIVING', 'IDLE'];
states = states.reduce((p, c, i) => {
	p[c] = i;
	return p;
}, {});

export default class Car extends Phaser.Sprite {
	constructor(game, x = -100, y = -100) {
		super(game, x, y, randomCarSprite());
		game.physics.arcade.enable(this);
		this.anchor.setTo(0.5 - config.CAR_LANE_OFFSET, 0.5);
		this.width = config.CAR_SIZE;
		this.height = config.CAR_SIZE;
		this.state = states.INIT;
		return this;
	}
	getVelocity() {
		return Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2));
	}
	setVelocity(val) {
		const values = splitValByAngle(val, this.rotation);
		this.body.velocity = Object.assign(this.body.velocity, values);
		return this;
	}
	getState() {
		if (this.state === states.DRIVING) {
			if (this.getAcceleration() > 0) {
				return states.ACCELERATING;
			} else if (this.getAcceleration() < 0) {
				return states.DECELERATING;
			}
			return states.DRIVING;
		}
		return this.state;
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
		this.street = street;
		this.rotateTo(pos.heading);
		return this;
	}
	getTravelDirection() {
		if (this.street) {
			return !isOpposedAngle(this.rotation, this.street.orientation);
		}
		return true;
	}
	limitVelocity() {
		if (this.getVelocity() >= config.CAR_MAXSPEED) {
			this.setAcceleration(0);
		}
		return this;
	}
	checkTurn() {
		const car = this;
		const distance = car.street.getCovered(car, !car.getTravelDirection()).toFixed(3);
		if (distance >= 1 && car.getState() !== states.TURNING) {
			car.state = states.TURNING;
			setTimeout(() => {
				car.state = states.DRIVING;
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
		return this;
	}
}
