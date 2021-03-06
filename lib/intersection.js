import hash from 'object-hash'
import Phaser from 'phaser'
import config from './config'
import {getAngle} from './utils'

export default class Intersection extends Phaser.Point {
  constructor (x, y) {
    super(x, y)
    this.streets = []
    this.graphic = null
    this.id = hash.sha1({
      x,
      y
    })
    this.equal = Phaser.Point.equals.bind(Phaser.Point, this)
  }

  draw (graphics, color = 0xff00ff) {
    graphics.lineStyle(config.STREET_WIDTH / 2, color, 0.5)
    this.graphic = graphics.drawCircle(this.x, this.y, config.STREET_WIDTH / 2)
  }
  addStreet (street) {
    if (!this.onStreet(street)) {
      this.streets.push(street)
    }
  }
  // check if an intersection is on a specific street
  onStreet (street) {
    return this.streets.find(s => s.id === street.id) !== undefined
  }

  // get the angle between two streets on an intersection
  getAngle (street1, street2) {
    // get the points surrounding an intersection (if existent)
    const getPoints = (street) => { // use arrow to preserve 'this'
      const iIx = street.intersections.indexOf(this)
      const l = street.points.length // allow slice to step over the max index
      const points = street.points.slice(Math.max(iIx - 1, 0), Math.min(l, iIx + 2))
      if (points.length < 2) {
        throw new Error('Calculating angle returns less than 2 points', street)
      }
      return points // 2-3 points
    }

    const p1 = getPoints(street1)
    const p2 = getPoints(street2)
    // figure out which point is the actual intersection (common point)
    let p1Ix, p2Ix
    if (p1.length === 2) {
      if (p1[0].equals(this)) {
        p1Ix = 0
      } else p1Ix = 1
    } else p1Ix = 1

    if (p2.length === 2) {
      if (p2[0].equals(this)) {
        p2Ix = 0
      } else p2Ix = 1
    } else p2Ix = 1

    const angles = []
    for (let i = 1; i < p1.length; i++) {
      for (let o = 1; o < p2.length; o++) {
        angles.push({
          angle: getAngle(p1[p1Ix], p1[i * (i - p1Ix)], p2[o * (o - p2Ix)]), // rad
          street1: p1[i * (i - p1Ix)],
          street2: p2[o * (o - p2Ix)]
        })
      }
    }

    return angles
  }
}
