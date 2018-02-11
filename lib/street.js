/* global game */
import generateUUID from 'uuid'
import config from './config'

function totalLength (street) {
  const points = street.points
  let length = 0
  for (let i = 1; i < points.length; i++) {
    length += points[i - 1].distance(points[i])
  }
  return length
}

class Street {
  constructor (points) {
    this.points = points
    this.start = this.points[0]
    this.end = this.points.slice(-1)[0]
    this.deltaX = this.end.x - this.start.x
    this.deltaY = this.end.y - this.start.y
    this.length = totalLength(this)
    this.orientation = Math.atan2(this.deltaY, this.deltaX) + (Math.PI / 2)
    this.neighbors = new Array(points.length).fill([])
    this.id = generateUUID()
  }

  draw (graphics, color = 0x666666) {
    graphics.lineStyle(config.STREET_WIDTH, color, 0.5)
    graphics.moveTo(this.start.x, this.start.y)
    for (let i = 1; i < this.points.length; i++) {
      graphics.lineTo(this.points[i].x, this.points[i].y)
    }

    if (config.DEBUG) {
      // helper lines
      graphics.lineStyle(2, 0xff00ff, 0.5)
      graphics.moveTo(this.start.x, this.start.y)
      graphics.lineTo(this.start.x, this.end.y)
      graphics.moveTo(this.start.x, this.start.y)
      graphics.lineTo(this.end.x, this.start.y)
    }
  }

  drawIntersections (graphics) {
    graphics.lineStyle(config.STREET_WIDTH / 2, 0xff00ff, 1)
    if (!this.start.graphic) {
      this.start.graphic = graphics.drawCircle(this.start.x, this.start.y, config.STREET_WIDTH / 2)
    }
    if (!this.end.graphic) {
      this.end.graphic = graphics.drawCircle(this.end.x, this.end.y, config.STREET_WIDTH / 2)
    }
  }

  getPositionAt (pct = Math.random()) {
    const xD = pct * this.deltaX
    const yD = pct * this.deltaY
    let heading = this.orientation
    // autoadjust travel direction
    if (pct > 0.5) {
      heading += Math.PI
    }
    return {
      x: this.start.x + xD,
      y: this.start.y + yD,
      heading
    }
  }
 /**
  * Calculate the % of traveled distance on the street
  *   if inverse: calculate distance to start instead of end
  */
  getCovered (point, inverse) {
    let end = this.end
    let start = this.start
    if (inverse) {
      end = start
      start = this.end
    }
    // does not verify the car is on track..
    let pct = start.distance(point) / this.length
    // set to negative if is before start
    if (end.distance(point) > this.length && start.distance(point) < end.distance(point)) {
      pct *= -1
    }
    return pct
  }

  // position is an integer refering to the "point" on the street
  addNeighbor (position, street) {
    const existing = this.neighbors[position]
    if (!existing.find(elm => elm === street.id)) {
      this.neighbors[position].push(street.id)
    }
  }

  getNeighbor (position) {
    const ids = this.neighbors[position]
    const sel = ids[Math.floor(Math.random() * ids.length)]
    return streets.find(elm => elm.id === sel)
  }

  getNeighbors (position) {
    const ids = this.neighbors[position] || []
    return streets.filter(elm => ids.indexOf(elm.id) > -1)
  }
}

export {Street as default}
