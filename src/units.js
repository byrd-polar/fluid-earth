import Qty from 'js-quantities/esm'

export function convert(value, originalUnit, newUnit) {
  if (!isFinite(value) || originalUnit === newUnit) return value

  return Qty(`${value} ${originalUnit}`).to(newUnit).scalar
}

export function prettyUnit(unit) {
  switch (unit) {
    case 'tempK': case 'degK': return 'K'
    case 'tempC': case 'degC': return '°C'
    case 'tempF': case 'degF': return '°F'
    case '0.0254 Mg/m^2': return 'in'
    case '0.01 Mg/m^2': return 'cm'
    case 'id': return 'ID'
    // using Unicode instead of <sup> mainly because of text-shadow issues
    default: return unit.replace('^2', '²').replace('^3', '³')
  }
}

const unitDials = [
  ['km/h', 'mph', 'm/s', 'kn'],
  ['tempC', 'tempF', 'tempK'],
  ['degC', 'degF', 'degK'],
  ['hPa', 'atm', 'mmHg', 'inHg'],
  ['km', 'mi'],
  ['m', 'ft'],
  ['mm', 'in', 'cm'],
  ['kg/m^2', '0.0254 Mg/m^2', '0.01 Mg/m^2'],
  ['id'],
]

const discreteUnits = ['id']
export function isDiscreteUnit(unit) {
  return discreteUnits.includes(unit)
}

const leadingUnits = ['id']
export function isLeadingUnit(unit) {
  return leadingUnits.includes(unit)
}

export function getUnitFromDial(compatibleUnit) {
  let dial = findDial(compatibleUnit)
  return dial ? dial[0] : compatibleUnit
}

export function rotateDial(compatibleUnit) {
  let dial = findDial(compatibleUnit)
  dial?.push(dial.shift())
}

export function hasDial(compatibleUnit) {
  return !!findDial(compatibleUnit)
}

let cache = new Map()

function findDial(compatibleUnit) {
  if (cache.has(compatibleUnit)) return cache.get(compatibleUnit)

  let dial = unitDials.find(d => d.includes(compatibleUnit))
  cache.set(compatibleUnit, dial)
  return dial
}
