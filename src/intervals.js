export default Object.freeze({
  'custom:NONE': {
    smallestPickerMode: 'hour',
    dateFormat: instantDateFormat,
    timeFormat: instantTimeFormat,
  },
  'custom:OSCAR': {
    smallestPickerMode: 'day',
    dateFormat: instantDateFormat,
    timeFormat: instantTimeFormat,
  },
  'hourly': {
    roundTo: 'hour',
    duration: { hours: 1 },
    smallestPickerMode: 'hour',
    dateFormat: instantDateFormat,
    timeFormat: instantTimeFormat,
  },
  'daily': {
    roundTo: 'day',
    duration: { days: 1 },
    smallestPickerMode: 'day',
    dateFormat: instantDateFormat,
    timeFormat: instantTimeFormat,
  },
  'daily-aggregate': {
    roundTo: { smallestUnit: 'day', roundingMode: 'floor' },
    duration: { days: 1 },
    smallestPickerMode: 'day',
    dateFormat: aggregateDayDateFormat,
    utcOnly: true,
  },
  'monthly-aggregate': {
    roundTo: { smallestUnit: 'month', roundingMode: 'floor' },
    duration: { months: 1 },
    smallestPickerMode: 'month',
    dateFormat: aggregateMonthDateFormat,
    utcOnly: true,
  },
  'yearly-aggregate': {
    roundTo: { smallestUnit: 'year', roundingMode: 'floor' },
    duration: { years: 1 },
    smallestPickerMode: 'year',
    dateFormat: aggregateYearDateFormat,
    utcOnly: true,
  },
})

function instantDateFormat(date, utc) {
  return date.toLocaleDateString([], {
    timeZone: utc ? 'UTC' : undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function instantTimeFormat(date, utc) {
  let string = date.toLocaleTimeString([], {
    timeZone: utc ? 'UTC' : undefined,
    hour12: utc ? false : undefined,
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  })
  // Fix the toLocaleTimeString output on Chromium-based browsers
  return string === '24:00 UTC' ? '00:00 UTC' : string
}

function aggregateDayDateFormat(date) {
   return date.toLocaleDateString([], {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function aggregateMonthDateFormat(date) {
   return date.toLocaleDateString([], {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
  })
}

function aggregateYearDateFormat(date) {
  return date.toLocaleDateString([], {
   timeZone: 'UTC',
   year: 'numeric'
 })
}
