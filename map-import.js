#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const es = require('event-stream')
const Osm2Obj = require('osm2obj')
const toArray = require('stream-to-array')

function getElements (filepath, filterFn) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filepath, 'utf8')
    .pipe(new Osm2Obj())
    .pipe(es.map((d, cb) => {
      if (filterFn(d)) {
        cb(null, d)
      } else cb() // discard element
    }))

    toArray(stream, (err, arr) => {
      if (err) reject(err)
      else resolve(arr)
    })
  })
}

function waysToGeoJSON (ways) {
  const features = ways
  .map(way => {
    const lineString = {
      'type': 'Feature',
      'properties': {
        'stroke': '#f0f',
        'stroke-width': 5
      },
      'geometry': {
        'type': 'LineString',
        'coordinates': []
      }
    }

    lineString.geometry.coordinates = way.coordinates.map(c => [c.lon, c.lat])
    return lineString
  })

  const geojson = {
    'type': 'FeatureCollection',
    'features': features
  }
  console.log(JSON.stringify(geojson))
}

function getWays (filepath, filterFn) {
  return getElements(filepath, filterFn) // residential for inner city, tertiary/secondary/primary for outer city
  .then(ways => {
    // w = w.filter(e => e.nodes.length === 2) // filter for ways with only 2 points
    const wayNodes = ways
    .map(e => e.nodes)
    .reduce((p, c) => {
      c.forEach(e => p.push(e))
      return p
    }, [])
    const wayNodeSelectorFn = d => d.type === 'node' && wayNodes.indexOf(d.id) > -1
    // get all nodes that are on the selected ways
    return getElements(filepath, wayNodeSelectorFn)
    .then(nodes => {
      ways = ways.map(w => {
        // create an array of node positions {lat, lon} for each way
        const pos = w.nodes.map(wn => {
          const node = nodes.find(n => n.id === wn)
          if (!node) {
            console.error(`no node information found for ${wn}`)
            return {lat: undefined, lon: undefined}
          } else {
            return {lat: node.lat, lon: node.lon}
          }
        })
        w.coordinates = pos
        return w
      })
      return ways
    })
  })
}

const filepath = path.normalize(path.join(__dirname, './marbach-city.osm'))
filterFn = d => d.type === 'way' && ['residential', 'secondary'].indexOf((d.tags || {}).highway) > -1

getWays(filepath, filterFn)
.then(ways => {
  ways = ways.map(w => {
    w.coordinates = [w.coordinates[0], w.coordinates.slice(-1)[0]]
    return w
  })

  const streets = ways.map(w => {
    return w.coordinates
  })
  console.log(JSON.stringify(streets, null, 2))
  return ways
})

module.exports = {
  getWays,
  waysToGeoJSON
}
