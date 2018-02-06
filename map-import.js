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

getElements(filepath, d => d.type === 'way' && (d.tags || {}).highway === 'residential')
.then(ways => {
  console.log(ways.length)
})
