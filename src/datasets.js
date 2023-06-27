import intervals from './intervals.js'
import { validOscarDates } from './oscar.js'
import colormaps from './map/colormaps/index.js'
import dataProjections, {
  singleArrayDataGet,
  pairedArrayDataGet,
} from './map/data-projections/'
import { clamp } from './math.js'
import { ZonedDateTime } from './temporal.js'
import { findClosestDateInAscendingList, throwIfNotOk } from './utility.js'
import { Float16Array } from '@petamoriken/float16'

const now = new Date()
const zeroProxy = new Proxy({}, { get() { return 0 } })
const nanDataArray = new Float16Array([-Infinity])
const zeroDataArray = new Float16Array([0])

class Dataset {
  constructor(core={}) {
    this.core         = core
    this.name         = core.name ?? 'none'
    this.path         = core.path ?? null
    this.width        = core.width ?? 1
    this.height       = core.height ?? 1
    this.start        = new Date(core.start ?? now)
    this.end          = new Date(core.end ?? now)
    this.interval     = intervals[core.interval] ?? intervals['custom:NONE']
    this.missing      = (core.missing ?? []).map(d => new Date(d))
    this.projection   = dataProjections[core.projection ?? 'GFS']
    this.bytesPerFile = this.width * this.height * 2

    let { width, height, projection } = this
    this.dataProps    = { width, height, projection }
    this.emptyData    = { width: 1, height: 1, projection }
  }

  get validDates() { return this._validDates ??= this.computeValidDates() }

  fetchCache = {}

  static fetchStatus = { progress: 0, total: 0 }
  static fetchListeners = []

  static notifyFetchListeners() {
    this.fetchListeners.forEach(f => f(this.fetchStatus))
  }

  async fetchData(date, signal) {
    if (!this.path) return this.emptyData

    let dateString = this.closestValidDate(date).toISOString()
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
      throwIfNotOk(response)
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

  closestValidDate(date, condition=(() => true)) {
    let candidate

    switch(this.interval) {
      case intervals['custom:NONE']:
        candidate = date
        break

      case intervals['custom:OSCAR']:
        candidate = findClosestDateInAscendingList(date, this.validDates)
        break

      default:
        candidate = new ZonedDateTime(date, true)
          .round(this.interval.roundTo)
          .date
        break
    }

    candidate = clamp(candidate, this.start, this.end)

    return (this.isMissingDate(candidate) || !condition(candidate))
      ? findClosestDateInAscendingList(date, this.validDates.filter(condition))
      : candidate
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

  constructor(core={}) {
    super(core)
    this.type         = 'gridded'
    this.colormap     = colormaps[core.colormap ?? 'VIRIDIS']
    this.domain       = core.domain ?? [0, 1]
    this.unit         = core.unit ?? ''
    this.originalUnit = core.originalUnit ?? ''
    this.scale        = core.scale ?? 'linear'
    this.emptyData    = {
      floatArray: nanDataArray,
      get(lonLat) { return NaN },
      originalUnit: this.originalUnit,
      ...this.emptyData,
    }
  }

  static filter(inventory) {
    return inventory
      .filter(d => d.colormap)
      .map(d => new GriddedDataset(d))
  }

  bufferToData(buffer) {
    return {
      floatArray: new Float16Array(buffer),
      get(lonLat) { return singleArrayDataGet(this, lonLat) },
      originalUnit: this.originalUnit,
      ...this.dataProps,
    }
  }
}

export class ParticleDataset extends Dataset {
  static none = new ParticleDataset()

  constructor(core={}) {
    super(core)
    this.type             = 'particle'
    this.particleLifetime = core.particleLifetime ?? 0
    this.particleCount    = core.particleCount ?? 0
    this.particleDisplay  = core.particleDisplay ?? zeroProxy
    this.bytesPerFile     = 2 * this.bytesPerFile
    this.emptyData        = {
      uVelocities: zeroDataArray,
      vVelocities: zeroDataArray,
      get(lonLat) { return 0 },
      ...this.emptyData,
    }
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
      get(lonLat) { return pairedArrayDataGet(this, lonLat) },
      ...this.dataProps,
    }
  }

  isCloseDate(date) {
    let closest = super.closestValidDate(date)

    // allow latest ocean currents to be displayed with latest ocean temps
    if (this.name === 'ocean surface currents') {
      return Math.abs(closest - date) < 6 * 24 * 60 * 60 * 1000
    }

    switch(this.interval) {
      case intervals['custom:NONE']:
        return true

      case intervals['custom:OSCAR']:
        return Math.abs(closest - date) < 6 * 24 * 60 * 60 * 1000

      default:
        let zdt = new ZonedDateTime(date, true).round(this.interval.roundTo)
        return zdt.date.getTime() === closest.getTime()
    }
  }
}
