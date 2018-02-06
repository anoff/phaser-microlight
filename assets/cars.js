const list = {
  audi: 'Audi',
  viper: 'Black_viper',
  car: 'Car',
  truck: 'Mini_truck',
  van: 'Mini_van',
  taxi: 'taxi',
  police: 'Police'
}

Object.keys(list).forEach(elm => {
  list[elm] += '.png'
})

function loadSprites (game) {
  Object.keys(list).forEach(elm => {
    game.load.image(elm, `assets/${list[elm]}`)
  })
}

function randomCar () {
  const keys = Object.keys(list)
  const index = Math.floor(Math.random() * keys.length)
  return keys[index]
}

export {loadSprites, randomCar}
