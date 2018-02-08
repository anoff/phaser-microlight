import hash from 'object-hash'
import Phaser from 'phaser'
import config from './config'

export default class Intersection extends Phaser.Point {
  constructor (x, y) {
    super(x, y)
    this.streets = []
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
}
