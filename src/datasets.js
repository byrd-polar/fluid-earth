import { validOscarDates } from './oscar.js'
import colormaps from './map/colormaps/index.js'
import dataProjections, {
  singleArrayDataGet,
  pairedArrayDataGet,
} from './map/data-projections/'
import { ZonedDateTime } from './temporal.js'
import { findClosestDateInAscendingList } from './utility.js'
import { Float16Array } from '@petamoriken/float16'

const zeroProxy = new Proxy({}, { get() { return 0 } })
const nanDataArray = new Float16Array([-Infinity])
const zeroDataArray = new Float16Array([0])

const intervals = {
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
}

class Dataset {
  constructor(core)  { this.core = core ?? {} }
  get name()         { return this.core.name ?? 'none' }
  get path()         { return this.core.path ?? null }
  get width()        { return this.core.width ?? 1 }
  get height()       { return this.core.height ?? 1 }
  get start()        { return new Date(this.core.start ?? new Date()) }
  get end()          { return new Date(this.core.end ?? new Date()) }
  get missing()      { return (this.core.missing ?? []).map(d => new Date(d)) }
  get interval()     {
    return intervals[this.core.interval] ?? intervals['custom:NONE']
  }
  get projection()   { return dataProjections[this.core.projection ?? 'GFS'] }
  get bytesPerFile() { return this.width * this.height * 2 }

  get dataProps() {
    return {
      width: this.width,
      height: this.height,
      projection: this.projection,
    }
  }

  fetchCache = {}

  static fetchStatus = { progress: 0, total: 0 }
  static fetchListeners = []

  static notifyFetchListeners() {
    this.fetchListeners.forEach(f => f(this.fetchStatus))
  }

  async fetchData(date, signal) {
    if (!this.path) return this.constructor.emptyData

    let dateString = date.toISOString()
    let cachedResponse = this.fetchCache[dateString]
    if (cachedResponse) return cachedResponse

    // __fev2r_api__ is '' by default, can be replaced by env variable
    let url = __fev2r_api__ + this.path + dateString + '.fp16.br'

    // workaround for ':' being an illegal character for filenames on Windows,
    if (__using_local_data_files__ && __windows__) url = url.replace(/:/g, '_')

    let byteArray = new Uint8Array(this.bytesPerFile)
    let offset = 0
    let status = this.constructor.fetchStatus

    status.total += this.bytesPerFile
    this.constructor.notifyFetchListeners()

    try {
      let response = await fetch(url, {
        signal,
        headers: { 'Cache-Control': 'no-cache' },
      })
      let reader = response.body.getReader()

      while (true) {
        let { done, value } = await reader.read()
        if (done) break

        byteArray.set(value, offset)
        offset += value.byteLength
        status.progress += value.byteLength
        this.constructor.notifyFetchListeners()
      }

    } catch(e) {
      status.total -= this.bytesPerFile
      status.progress -= offset
      throw e

    } finally {
      if (status.progress === status.total) {
        status.progress = 0
        status.total = 0
      }
      this.constructor.notifyFetchListeners()
    }

    let data = this.bufferToData(byteArray.buffer)
    this.fetchCache[dateString] = data
    return data
  }

  closestValidDate(date, oscarOptions={}) {
    if (date <= this.start) return this.start
    if (date >= this.end) return this.end

    switch(this.interval) {
      case intervals['custom:NONE']:
        return date

      case intervals['custom:OSCAR']:
        let {
          preserveMonth=false,
          preserveUTCMonth=false,
          excludedDate=undefined,
        } = oscarOptions

        let candidates = this.computeValidDates().filter(c => {
          return (!preserveMonth || c.getMonth() === date.getMonth())
              && (!preserveUTCMonth || c.getUTCMonth() === date.getUTCMonth())
              && (!excludedDate || c.getTime() !== excludedDate.getTime())
        })
        return findClosestDateInAscendingList(date, candidates)

      default:
        let closest = new ZonedDateTime(date, true)
          .round(this.interval.roundTo)
          .date

        return this.isMissingDate(closest)
          ? findClosestDateInAscendingList(date, this.computeValidDates())
          : closest
    }
  }

  computeValidDates() {
    switch(this.interval) {
      case intervals['custom:NONE']:
        return [this.start]

      case intervals['custom:OSCAR']:
        return validOscarDates(this.start, this.end)

      default:
        let dates = []

        let zdt = new ZonedDateTime(this.start, true)
        while (zdt.date.getTime() <= this.end.getTime()) {
          if (!this.isMissingDate(zdt.date)) dates.push(zdt.date)
          zdt = zdt.add(this.interval.duration)
        }
        return dates
    }
  }

  isMissingDate(date) {
    return this.missing.some(d => d.getTime() === date.getTime())
  }
}

export function addDatasetFetchListener(f) {
  Dataset.fetchListeners.push(f)
}

export class GriddedDataset extends Dataset {
  static none = new GriddedDataset()

  get type()         { return 'gridded' }
  get colormap()     { return colormaps[this.core.colormap ?? 'VIRIDIS'] }
  get domain()       { return this.core.domain ?? [0, 1] }
  get unit()         { return this.core.unit ?? '' }
  get originalUnit() { return this.core.originalUnit ?? '' }
  get scale()        { return this.core.scale ?? 'linear' }

  get dataProps() {
    return {
      unit: this.unit,
      originalUnit: this.originalUnit,
      get(lonLat) { return singleArrayDataGet(this, lonLat) },
      ...super.dataProps,
    }
  }

  static emptyData = {
    floatArray: nanDataArray,
    ...new GriddedDataset().dataProps,
  }

  static filter(inventory) {
    return inventory
      .filter(d => d.colormap)
      .map(d => new GriddedDataset(d))
  }

  bufferToData(buffer) {
    return {
      floatArray: new Float16Array(buffer),
      ...this.dataProps,
    }
  }
}

export class ParticleDataset extends Dataset {
  static none = new ParticleDataset()

  get type()             { return 'particle' }
  get particleLifetime() { return this.core.particleLifetime ?? 0 }
  get particleCount()    { return this.core.particleCount ?? 0 }
  get particleDisplay()  { return this.core.particleDisplay ?? zeroProxy }
  get bytesPerFile()     { return 2 * super.bytesPerFile }

  get dataProps() {
    return {
      get(lonLat) { return pairedArrayDataGet(this, lonLat) },
      ...super.dataProps,
    }
  }

  static emptyData = {
    uVelocities: zeroDataArray,
    vVelocities: zeroDataArray,
    ...new ParticleDataset().dataProps,
  }

  static filter(inventory) {
    return inventory
      .filter(d => d.particleDisplay)
      .map(d => new ParticleDataset(d))
  }

  bufferToData(buffer) {
    return {
      uVelocities: new Float16Array(buffer.slice(0, buffer.byteLength / 2)),
      vVelocities: new Float16Array(buffer.slice(buffer.byteLength / 2)),
      ...this.dataProps,
    }
  }

  // same as super except returns null if closest date is not "close enough",
  // i.e. too before this.start or too after this.end
  closestValidDate(date, oscarOptions={}) {
    let closest = super.closestValidDate(date, oscarOptions)

    switch(this.interval) {
      case intervals['custom:NONE']:
        return closest

      case intervals['custom:OSCAR']:
        return Math.abs(closest - date) < 6 * 24 * 60 * 60 * 1000
          ? closest
          : null

      default:
        let zdt = new ZonedDateTime(date, true).round(this.interval.roundTo)
        return zdt.date.getTime() === closest.getTime()
          ? closest
          : null
    }
  }
}
