import Phaser from 'phaser';
import config from './config';

export default class Car extends Phaser.Sprite {
	constructor(game, x = -100, y = -100) {
		super(game, x, y, 'car');
		game.physics.arcade.enable(this);
		this.anchor.setTo(0.5, 0.5);
		this.width = config.CAR_SIZE;
		this.height = config.CAR_SIZE;
		return this;
	}
	getVelocity() {
		return Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2));
	}
	setVelocity(val) {
		const angle = this.rotation;
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
		this.body.velocity.x = val * sin;
		this.body.velocity.y = -val * cos;
		return this;
	}
	rotateTo(val) {
		this.rotation = val;
		// update velocity vectors
		this.setVelocity(this.getVelocity());
		return this;
	}
	setStreet(street, pct = 0) {
		const pos = street.getPositionAt(pct);
		this.x = pos.x;
		this.y = pos.y;
		this.rotateTo(pos.heading);
		this.street = street;
		this.travelInverse = Math.abs(street.orientation - pos.heading) > 0.1;
		return this;
	}
}
