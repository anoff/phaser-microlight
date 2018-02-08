/* global game */
import Phaser from 'phaser'
import hash from 'object-hash'
import config from './config'
import Street from './street'
import osmImport from '../assets/marbach-city-simple.json'

function calculateIntersections (streets) {
  const intersections = []
  const start = new Date()
  // identify all points where a street ends on another one
  streets.forEach((street, ix) => {
    [street.start, street.end].forEach(point => {
      streets.forEach(s => {
        const samePoints = s.points.filter(p => {
          return Phaser.Point.equals(p, point)
        })
        if (s.id !== street.id && samePoints.length) {
          const newIs = new Intersection(point.x, point.y)
          let intersection
          const existingIs = intersections.find(e => e.id === newIs.id)
          if (!existingIs) {
            intersections.push(newIs)
            intersection = newIs
            // console.log('new intersection', newIs.id)
          } else {
            intersection = existingIs
          }
          // update intersection with street IDs
          intersection.addStreet(street)
          intersection.addStreet(s)
        }
      })
    })
  })
  console.log(new Date() - start)
}

class Intersection extends Phaser.Point {
  constructor (x, y) {
    super(x, y)
    this.streets = []
    this.id = hash.sha1({x, y})
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
class World {
  constructor (graphics) {
    this.graphics = graphics
    this.streets = []
    this.intersections = []
  }

  fromOSM (osmImportJSON) {
    // transform to from WGS84 to local coordinates
    // lat = y, lon = x
    const latMin = Math.min(...osmImportJSON.map(elm => Math.min(elm[0].lat, elm[1].lat)))
    const latMax = Math.max(...osmImportJSON.map(elm => Math.max(elm[0].lat, elm[1].lat)))
    const lonMin = Math.min(...osmImportJSON.map(elm => Math.min(elm[0].lon, elm[1].lon)))
    const lonMax = Math.max(...osmImportJSON.map(elm => Math.max(elm[0].lon, elm[1].lon)))

    const streets = osmImportJSON.map(elm => {
      return elm.map(point => {
        const y = config.GAME_SIZE - (point.lat - latMin) / (latMax - latMin) * config.GAME_SIZE
        const x = (point.lon - lonMin) / (lonMax - lonMin) * config.GAME_SIZE
        return new Phaser.Point(x, y)
      })
    })
    .map(roadpoints => new Street(roadpoints))

    this.streets = streets
    this.intersections = calculateIntersections(streets)
  }

  draw () {
    this.streets.forEach((street, ix) => {
      let color
      if (!street.neighbors.find(n => n.length > 0)) {
        color = 0xffff00
      } else color = 0x666666
      street.draw(this.graphics, color)
      street.drawIntersections(this.graphics)
    // draw numbers on street
      const pos = street.getPositionAt(0.13)
      const text = game.add.text(pos.x, pos.y, ix.toString(), {align: 'center', fill: '#000000', fontSize: '10px'})
      text.anchor.set(0.5)
    })
  }
  init () {
    this.fromOSM(osmImport)
    this.draw()
  }
}

export {World as default}
