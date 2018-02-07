import Phaser from 'phaser'
import isOpposedAngle from 'is-opposed-angle'
import {randomCar as randomCarSprite} from '../assets/cars'
import config from './config'

const splitValByAngle = (val, angle) => {
  const sin = Math.sin(angle)
  const cos = Math.cos(angle)
  return new Phaser.Point(val * sin, -val * cos)
}
let states = ['INIT', 'ACCELERATING', 'DECELERATING', 'TURNING', 'DRIVING', 'IDLE', 'STOPPED']
states = states.reduce((p, c, i) => {
  p[c] = i
  return p
}, {})

export default class Car extends Phaser.Sprite {
  constructor (game, x = -100, y = -100) {
    super(game, x, y, randomCarSprite())
    this.game = game
    game.physics.arcade.enable(this)
    this.anchor.setTo(0.5 - config.CAR_LANE_OFFSET, 0.5)
    this.width = config.CAR_SIZE
    this.height = config.CAR_SIZE
    this.maxSpeed = config.CAR_MAXSPEED
    this.maxAcceleration = config.CAR_ACCELERATION
    this.state = states.INIT
    return this
  }
  getVelocity () {
    const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x) + (Math.PI / 2)
    // not exactly sure why 90° offset
    //   might be due to Phasers coord system
    const sign = isOpposedAngle(angle, this.rotation) ? -1 : 1
    const val = Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2))
    return sign * val
  }
  setVelocity (val) {
    const values = splitValByAngle(val, this.rotation)
    this.body.velocity = Object.assign(this.body.velocity, values)
    return this
  }
  getState () {
    if (this.state === states.DRIVING) {
      if (this.getAcceleration() > 0) {
        return states.ACCELERATING
      } else if (this.getAcceleration() < 0) {
        return states.DECELERATING
      }
      return states.DRIVING
    }
    return this.state
  }
  setAcceleration (val) {
    const values = splitValByAngle(val, this.rotation)
    this.body.acceleration = Object.assign(this.body.acceleration, values)
    return this
  }
  getAcceleration () {
    return Math.sqrt(Math.pow(this.body.acceleration.x, 2) + Math.pow(this.body.acceleration.y, 2))
  }
  rotateTo (val) {
    this.rotation = val
    // update velocity vectors
    this.setVelocity(this.getVelocity())
    this.setAcceleration(this.getAcceleration())
    return this
  }
  setStreet (street, pct = 0) {
    const pos = street.getPositionAt(pct)
    this.x = pos.x
    this.y = pos.y
    this.street = street
    this.rotateTo(pos.heading)
    return this
  }
  getTravelDirection () {
    if (this.street) {
      return !isOpposedAngle(this.rotation, this.street.orientation)
    }
    return true
  }
  limitVelocity () {
    const vel = this.getVelocity()
    if (vel >= this.maxSpeed) {
      this.setAcceleration(0)
      this.setVelocity(this.maxSpeed)
    } else if (vel <= 0 && this.getAcceleration() !== 0) {
      if (this.getState() === states.DECELERATING) {
        this.state = states.STOPPED
      }
      this.setAcceleration(0)
      this.setVelocity(0)
    }
    return this
  }
  lookAhead () {
    // distance to end of street
    const dir = this.getTravelDirection()
    const dist = this.street.getCovered(this, dir) * this.street.length
    // calculate required break distance
    const timeToStop = this.getVelocity() / this.maxAcceleration
    const minDist = (this.getVelocity() * timeToStop) + (0.5 * -this.maxAcceleration * Math.pow(timeToStop, 2))
    if (dist <= minDist + config.INTERSECTION_OFFSET && (this.getState() !== states.DECELERATING && this.getState() !== states.TURNING)) {
      this.state = states.DECELERATING
      this.setAcceleration(-this.maxAcceleration)
    }
    return this
  }
  checkTurn () {
    const car = this
    const distance = car.street.getCovered(car, !car.getTravelDirection()).toFixed(3)
    if ((distance >= 1 || car.getState() === states.STOPPED) && car.getState() !== states.TURNING) {
      car.state = states.TURNING
      const pos = car.street.getCovered(car) > 0.5 ? car.street.points.length - 1 : 0
      const nextStreet = car.street.getNeighbor(pos)
      let startPos
      if (nextStreet) {
        // determine if car should be placed at start/end of segments
        const atStart = nextStreet.start.distance(car) < nextStreet.end.distance(car)
        const pos = nextStreet.getPositionAt(atStart ? 0.1 : 0.9)
        startPos = {x: pos.x, y: pos.y, rotation: pos.heading}
      } else {
        startPos = {x: car.x, y: car.y}
        startPos.rotation = car.rotation + Math.PI
      }
      // fix current rotation to prevent weird animations
      const a1 = car.rotation
      const a2 = startPos.rotation
      if (Math.abs(a2 - a1) > Math.abs(a2 - (a1 + (2 * Math.PI)))) {
        car.rotation += 2 * Math.PI
      }

      const animation = this.game.add.tween(this)
      animation.to(startPos, 500, Phaser.Easing.Power0)
      animation.onComplete.add(() => {
        car.street = nextStreet || car.street
        car.setAcceleration(car.maxAcceleration)
        car.setVelocity(50)
        car.state = states.DRIVING
      })
      animation.start()
    }
    return this
  }
}
