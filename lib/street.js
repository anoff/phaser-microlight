import {generate as generateUUID} from 'shortid'
import config from './config'

function totalLength (street) {
  const points = street.points
  let length = 0
  for (let i = 1; i < points.length; i++) {
    length += points[i - 1].distance(points[i])
  }
  return length
}

let cnt = 0
class Street {
  constructor (points) {
    this.points = points
    this.intersections = new Array(this.points.length)
    this.start = this.points[0]
    this.end = this.points.slice(-1)[0]
    this.graphic = []
    this.length = totalLength(this)
    this.id = generateUUID()
    this.ix = cnt++
  }

  draw (graphics, color = 0x666666) {
    // if (this.ix === 109) color = 0x00ff00 // debug coloring
    graphics.lineStyle(config.STREET_WIDTH, color, 0.5)
    graphics.moveTo(this.start.x, this.start.y)
    for (let i = 1; i < this.points.length; i++) {
      this.graphic.push(graphics.lineTo(this.points[i].x, this.points[i].y))
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

  drawEnds (graphics) {
    graphics.lineStyle(config.STREET_WIDTH / 2, 0x00ff00, 1)
    if (!this.start.graphic) {
      this.start.graphic = graphics.drawCircle(this.start.x, this.start.y, config.STREET_WIDTH / 3)
    }
    if (!this.end.graphic) {
      this.end.graphic = graphics.drawCircle(this.end.x, this.end.y, config.STREET_WIDTH / 3)
    }
  }

  addIntersection (intersection) {
    if (!this.onIntersection(intersection)) {
      // figure out on which street segment to add the intersection
      const ix = this.points.indexOf(this.points.find(p => intersection.equal(p)))
      if (this.intersections[ix]) {
        throw new Error('Intersection already exists at street', this, intersection)
      }
      this.intersections[ix] = intersection
    }
  }
  // check if this street is on an intersection
  onIntersection (intersection) {
    return this.intersections.find(i => i && i.id === intersection.id)
  }
}

export {Street as default}
