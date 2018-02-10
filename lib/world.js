/* global game */
import Phaser from 'phaser'
import config from './config'
import Street from './street'
import Intersection from './intersection'
import osmImport from '../assets/marbach-city-simple.json'

function calculateIntersections (streets) {
  const intersections = []
  const start = new Date()
  // identify all points where a street ends on another one
  streets.forEach((street, ix) => {
    street.points.forEach(point => {
      streets.forEach(s => {
        const samePoints = s.points.filter(p => {
          return Phaser.Point.equals(p, point)
        })
        if (s.id !== street.id && samePoints.length) {
          // check if 'intersection' is between two road segments that are almost in the same direction

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
  console.log('calculating intersections done', new Date() - start)
  // add intersections relation to streets
  intersections.forEach(intersection => {
    intersection.streets.forEach(s => s.addIntersection(intersection))
  })
  console.log('updating streets done', new Date() - start)
  return intersections
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
      street.draw(this.graphics)
      street.drawEnds(this.graphics)
    // draw numbers on street
      const pos = street.points[Math.floor(street.points.length * 0.5)]
      const text = game.add.text(pos.x, pos.y, ix.toString(), {align: 'center', fill: '#000000', fontSize: '10px'})
      text.anchor.set(0.5)
    })

    this.intersections.forEach(intersection => intersection.draw(this.graphics))
  }
  init () {
    this.fromOSM(osmImport)
    this.purge()
    this.draw()
    const is = this.intersections[70]
    this.graphics.drawCircle(is.x, is.y, 20)
    console.log('getting angle for ', is.id, is.streets)
    console.log(is.getAngle(is.streets[0], is.streets[1]).map(e => e.angle))
  }
  purge () {
    this.streets.forEach((s, ix) => {
      // remove streets with no intersections
      if (!s.intersections.find(e => e)) {
        this.streets.splice(ix, 1)
      }
    })
    this.intersections.forEach((is, ix) => {
      // TODO: figure out which intersections (with only 2 streets) have close to 180 angles and remove them
      // need to be able to merge street objects :thinking:, maybe put into import instead...
    })
  }
}

export {World as default}
