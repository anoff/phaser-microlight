// disable phaser banner in console
window.PhaserGlobal = {
  hideBanner: true
}

// magic numbers go here
const c = {
  GAME_SIZE: 600,
  STREET_WIDTH: 10,
  CAR_SIZE: 40,
  CAR_LANE_OFFSET: 0.3,
  DEBUG: false
}
// values that need some magic numbers
const derived = {
  CAR_MAXSPEED: () => c.GAME_SIZE / 3,
  CAR_ACCELERATION: () => c.CAR_MAXSPEED,
  INTERSECTION_OFFSET: () => c.CAR_SIZE / 2
}

// helper to create dependend config values
function addDepVal (name, fn) {
  const res = fn()
  if (typeof res === 'undefined' || isNaN(res)) {
    throw new Error(`Tried setting ${name}=${res}. Assume thats not what you want here`)
  } else if (c[name] !== undefined) {
    throw new Error(`trying to overwrite ${name}(=${c[name]}) with ${fn()}`)
  }
  c[name] = fn()
}
// calculate derived values
Object.keys(derived).forEach(key => addDepVal(key, derived[key]))

export default c
