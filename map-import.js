#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const es = require('event-stream')
const Osm2Obj = require('osm2obj')
const toArray = require('stream-to-array')

const filepath = path.normalize(path.join(__dirname, './marbach.osm'))
console.log(filepath)

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

let ways
getElements(filepath, d => d.type === 'way' && (d.tags || {}).highway === 'residential')
.then(w => {
  w = w.filter(e => e.nodes.length === 2)
  const wayNodes = w
  .map(e => e.nodes)
  .reduce((p, c) => {
    c.forEach(e => p.push(e))
    return p
  }, [])
  const wayNodeSelectorFn = d => d.type === 'node' && wayNodes.indexOf(d.id) > -1
  ways = w
  return getElements(filepath, wayNodeSelectorFn)
})
.then(nodes => {
  ways = ways.map(w => {
    const pos = w.nodes.map(wn => {
      const node = nodes.find(n => n.id === wn)
      if (!node) {
        console.error(`no node information found for ${wn}`)
        return {lat: undefined, lon: undefined}
      } else {
        return {lat: node.lat, lon: node.lon}
      }
    })
    w.position = pos
    return w
  })
  console.log(ways)
})
