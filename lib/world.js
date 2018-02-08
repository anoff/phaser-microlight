/* global game */
import Phaser from 'phaser'
import generateUUID from 'uuid'
import config from './config'
import Street from './street'

function calculateIntersections (streets) {

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
      if ([125, 59].indexOf(ix) > -1) {
        console.log(ix, street.points)
      }
    // draw numbers on street
      const pos = street.getPositionAt(0.13)
      const text = game.add.text(pos.x, pos.y, ix.toString(), {align: 'center', fill: '#000000', fontSize: '14px'})
      text.anchor.set(0.5)
    })
  }
}

export {World as default}
