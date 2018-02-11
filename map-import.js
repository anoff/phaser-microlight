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

async function getWays (filepath, filterFn) {
  // get unique ways in this area
  const ways = await getElements(filepath, filterFn) // residential for inner city, tertiary/secondary/primary for outer city
  const wayNodes = ways
  .map(e => e.nodes)
  .reduce((p, c) => {
    c.forEach(e => p.push(e))
    return p
  }, [])
  const wayNodeSelectorFn = d => d.type === 'node' && wayNodes.indexOf(d.id) > -1
  // get all nodes that are on the selected ways
  const nodes = await getElements(filepath, wayNodeSelectorFn)
  // merge all individual nodes into the 'way' aggregation
  const roadElements = ways.map(w => {
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

  return roadElements
}

const filepath = path.normalize(path.join(__dirname, './marbach-city.osm'))
const filterFn = d => d.type === 'way' && ['residential', 'secondary'].indexOf((d.tags || {}).highway) > -1

getWays(filepath, filterFn)
.then(ways => {
  const streets = ways.map(w => {
    return w.coordinates
  })
  console.log(JSON.stringify(streets, null, 2))
})

module.exports = {
  getWays,
  waysToGeoJSON
}
