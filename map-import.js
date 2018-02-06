#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const OSMStream = require('node-osm-stream')
const parser = OSMStream()

const filepath = path.normalize(path.join(__dirname, './marbach.osm'))

console.log(filepath)

const rs = fs.createReadStream(filepath, 'utf8')

// open a local .osm filestream
rs.pipe(parser)

parser.on('node', function (node, callback) {
    // Modify current node object as you wish
    // and pass it back to the callback.
    // Or pass 'null' or 'false' to prevent the object being
    // written to outgoing stream
  // console.log(node)
  callback(node)
})

parser.on('way', function (way, callback) { console.log(way); callback(way) })

parser.on('relation', function (relation, callback) { callback(relation) })
