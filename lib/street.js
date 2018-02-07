/* global game */
import Phaser from 'phaser'
import generateUUID from 'uuid'
import config from './config'
import streetmap from '../assets/marbach-city-simple.json'

// lat = y, lon = x
const latMin = Math.min(...streetmap.map(elm => Math.min(elm[0].lat, elm[1].lat)))
const latMax = Math.max(...streetmap.map(elm => Math.max(elm[0].lat, elm[1].lat)))
const lonMin = Math.min(...streetmap.map(elm => Math.min(elm[0].lon, elm[1].lon)))
const lonMax = Math.max(...streetmap.map(elm => Math.max(elm[0].lon, elm[1].lon)))

const map = streetmap.map(elm => {
  return elm.map(point => {
    const y = config.GAME_SIZE - (point.lat - latMin) / (latMax - latMin) * config.GAME_SIZE
    const x = (point.lon - lonMin) / (lonMax - lonMin) * config.GAME_SIZE
    return new Phaser.Point(x, y)
  })
})

function totalLength (street) {
  const points = street.points
  let length = 0
  for (let i = 1; i < points.length; i++) {
    length += points[i - 1].distance(points[i])
  }
  return length
}

const streets = []

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
    graphics.lineStyle(config.STREET_WIDTH, color, 1)
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

function createMap (graphics) {
  map.forEach(roadpoints => streets.push(new Street(roadpoints)))
  // populate neighbors of each street
  streets.forEach(street => {
    street.points.forEach((point, ix) => {
      streets
        .filter(elm => street.id !== elm.id)
        .filter(elm => {
          const sameStart = elm.start.x === point.x && elm.start.y === point.y
          const sameEnd = elm.end.x === point.x && elm.end.y === point.y
          return sameStart || sameEnd
        }).forEach(street.addNeighbor.bind(street, ix))
    })
  })
  streets.forEach((street, ix) => {
    let color
    if (!street.neighbors.find(n => n.length > 0)) {
      color = 0xff0ff
    } else color = 0x666666
    street.draw(graphics, color)
    street.drawIntersections(graphics)
    streets.push(street)
    // draw numbers on street
    const pos = street.getPositionAt(0.13)
    const text = game.add.text(pos.x, pos.y, ix.toString(), {align: 'center', fill: '#ffffff', fontSize: '14px'})
    text.anchor.set(0.5)
  })
}

export {Street as default, createMap, streets}
