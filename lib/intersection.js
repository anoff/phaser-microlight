import hash from 'object-hash'
import Phaser from 'phaser'
import config from './config'

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
      console.log(street, iIx, l, Math.max(iIx - 1, 0), Math.min(l, iIx + 2))
      const points = street.points.slice(Math.max(iIx - 1, 0), Math.min(l, iIx + 2))
      if (points.length < 2) {
        throw new Error('Calculating angle returns less than 2 points', street)
      }
      return points // 2-3 points
    }

    const getAngle = (points1, points2) => {
      if (points1.length !== 2 || points2.length !== 2) {
        throw new Error('Need to input arrays with length of 2 each', points1, points2)
      }
      const m1 = (points1[1].y - points1[0].y) / (points1[1].x - points1[0].x)
      const m2 = (points2[1].y - points2[0].y) / (points2[1].x - points2[0].x)
      console.log('m1, m2', m1, m2)
      return Math.atan(Math.abs((m2 - m1) / (1 + m1 * m2)))
    }
    const p1 = getPoints(street1)
    const p2 = getPoints(street2)
    console.log(p1.length, p2.length, p1, p2)
    console.log(getAngle(p1.slice(0, 2), p2) * 180 / Math.PI)
  }
}
