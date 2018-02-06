/* global game */
import Phaser from 'phaser'
import generateUUID from 'uuid'
import config from './config'

let intersections = [
  // 100 is max (autoscaled)
  [5, 5],
  [10, 30],
  [50, 30],
  [26, 76],
  [90, 85],
  [70, 50],
  [66, 10]
]
intersections = intersections.map(elm => {
  return [
    elm[0] / 100 * config.GAME_SIZE, elm[1] / 100 * config.GAME_SIZE
  ]
})
.map(elm => new Phaser.Point(elm[0], elm[1]))
.map(elm => {
  elm.isBlocked = false
  return elm
})

const segments = [
  // connect intersections (index)
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 5],
  [1, 3],
  [3, 5],
  [0, 6],
  [2, 6],
  [4, 6]
]
const streets = []

class Street {
  constructor (start, end) {
    this.start = start
    this.end = end
    this.deltaX = this.end.x - this.start.x
    this.deltaY = this.end.y - this.start.y
    this.length = this.start.distance(this.end)
    this.orientation = Math.atan2(this.deltaY, this.deltaX) + (Math.PI / 2)
    this.neighbors = {start: [], end: []}
    this.id = generateUUID()
  }

  draw (graphics) {
    graphics.lineStyle(config.STREET_WIDTH, 0x666666, 1)
    graphics.moveTo(this.start.x, this.start.y)
    graphics.lineTo(this.end.x, this.end.y)

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
    graphics.lineStyle(config.STREET_WIDTH / 2, 0x666666, 1)
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

  // position is a string 'start' or 'end'
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

function createMap (graphics) {
  segments.forEach((elm, ix) => {
    const start = intersections[elm[0]]
    const end = intersections[elm[1]]
    const street = new Street(start, end)
    street.draw(graphics)
    street.drawIntersections(graphics)
    streets.push(street)
    // populate neighbors of each street
    streets.forEach(street => {
      ['start', 'end'].forEach(position => {
        const point = street[position]
        streets
          .filter(elm => street.id !== elm.id)
          .filter(elm => {
            const sameStart = elm.start.x === point.x && elm.start.y === point.y
            const sameEnd = elm.end.x === point.x && elm.end.y === point.y
            return sameStart || sameEnd
          }).forEach(street.addNeighbor.bind(street, position))
      })
    })
    // draw numbers on street
    const pos = street.getPositionAt(0.13)
    const text = game.add.text(pos.x, pos.y, ix.toString(), {align: 'center', fill: '#ffffff', fontSize: '14px'})
    text.anchor.set(0.5)
  })
}

export {Street as default, createMap, streets}
