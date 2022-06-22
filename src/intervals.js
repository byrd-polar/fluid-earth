export default Object.freeze({
  'custom:NONE': {},
  'custom:OSCAR': {},
  'hourly': {
    roundTo: 'hour',
    duration: { hours: 1 },
  },
  'daily': {
    roundTo: 'day',
    duration: { days: 1 },
  },
  'monthly-aggregate': {
    roundTo: { smallestUnit: 'month', roundingMode: 'floor' },
    duration: { months: 1 },
  },
})
