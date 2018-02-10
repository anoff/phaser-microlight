// get angle between three points (p1 being a common point)
// p2 -\
//      - p1
// p3 -/
function getAngle (p1, p2, p3) {
  // https://stackoverflow.com/questions/2946327/inner-angle-between-two-lines
  const dx21 = p2.x - p1.x
  const dx31 = p3.x - p1.x
  const dy21 = p2.y - p1.y
  const dy31 = p3.y - p1.y
  const m12 = Math.sqrt(dx21 * dx21 + dy21 * dy21)
  const m13 = Math.sqrt(dx31 * dx31 + dy31 * dy31)
  return Math.acos((dx21 * dx31 + dy21 * dy31) / (m12 * m13))
}

export { getAngle }
