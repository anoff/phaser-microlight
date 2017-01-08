phaser-microlight
===
> vehicle behavior / traffic light simulation based on phaser 🚦🚗

[![screenshot](./screenshot.png)](https://anoff.github.io/phaser-microlight)

>**Note:**
This is a little playground of mine to play around with the [Phaser](https://phaser.io) game engine. It is not really considered to be (or become) a fully functional game.


You can find the latest version running on my [github pages](https://anoff.github.io/phaser-microlight/)

## Features

* es6 module loader using webpack
* draw street layout based on `(x,y)` intersections
* spawn cars at random positions on the street
* add additional cars by hitting the `SPACE` key
* cars accelerate and decelerate into intersections
* random turns at intersection to neighboring streets
* car collision
    * need to be on same street and same heading direction
    * the older of the two cars gets removed

## Ideas

* [ ] introduce traffic lights that _block_ intersections
* [ ] make cars stop if another car is in front
* [ ] grab street layouts from real world cities via OSM/gmaps API
* [ ] interactive mode to create street layout

## Getting started

In case you want to run the stuff yourself locally

```bash
# install dependencies
yarn
# start dev server
npm start
```

## Credits

* Car sprites: [unluckystudio.com](http://unluckystudio.com/game-art-giveaway-7-top-down-vehicles-sprites-pack/)

## License

MIT © [Andreas Offenhäuser](http//anoff.io)
