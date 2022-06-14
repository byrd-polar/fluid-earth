import colormaps from './map/colormaps/index.js'
import dataProjections, {
  singleArrayDataGet,
  pairedArrayDataGet,
} from './map/data-projections/'
import { Float16Array } from '@petamoriken/float16'

const zeroProxy = new Proxy({}, { get() { return 0 } })
const emptyDataArray = new Float16Array([-Infinity])

class Dataset {
  constructor(core)  { this.core = core ?? {} }
  get name()         { return this.core.name ?? 'none' }
  get path()         { return this.core.path ?? null }
  get width()        { return this.core.width ?? 1 }
  get height()       { return this.core.height ?? 1 }
  get start()        { return new Date(this.core.start ?? new Date()) }
  get end()          { return new Date(this.core.end ?? new Date()) }
  get missing()      { return (this.core.missing ?? []).map(d => new Date(d)) }
  get interval()     { return this.core.intervalInHours ?? 1 }
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

  static progress = 0
  static total = 0
  static fetchListeners = []

  static notifyFetchListeners() {
    this.fetchListeners.forEach(f => f(this.progress, this.total))
  }

  async fetchData(date, signal) {
    if (!this.path) return this.constructor.emptyData

    let dateString = date.toISOString()
    let cachedResponse = this.fetchCache[dateString]
    if (cachedResponse) return cachedResponse

    // __fev2r_api__ is '' by default, can be replaced by env variable
    let url = __fev2r_api__ + this.path + dateString + '.fp16.br'

    // workaround for ':' being an illegal character for filenames on Windows,
    if (__using_local_data_files__ && __windows__) {
      url = url.replace(/:/g, '_');
    }

    let values = []
    let thisProgress = 0
    this.constructor.total += this.bytesPerFile
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

        values.push(value)
        thisProgress += value.byteLength
        this.constructor.progress += value.byteLength
        this.constructor.notifyFetchListeners()
      }

    } catch(e) {
      this.constructor.total -= this.bytesPerFile
      this.constructor.progress -= thisProgress
      throw e

    } finally {
      if (this.constructor.progress === this.constructor.total) {
        this.constructor.progress = 0
        this.constructor.total = 0
      }
      this.constructor.notifyFetchListeners()
    }

    let buffer = await new Blob(values).arrayBuffer()
    let data = this.bufferToData(buffer)
    this.fetchCache[dateString] = data
    return data
  }
}

export function addDatasetFetchListener(f) {
  Dataset.fetchListeners.push(f)
}

export class GriddedDataset extends Dataset {
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
    floatArray: emptyDataArray,
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
  get type()             { return 'particle' }
  get particleLifetime() { return this.core.particleLifetime ?? 0 }
  get particleCount()    { return this.core.particleCount ?? 1 }
  get particleDisplay()  { return this.core.particleDisplay ?? zeroProxy }
  get bytesPerFile()     { return 2 * super.bytesPerFile }

  get dataProps() {
    return {
      get(lonLat) { return pairedArrayDataGet(this, lonLat) },
      ...super.dataProps,
    }
  }

  static emptyData = {
    uVelocities: emptyDataArray,
    vVelocities: emptyDataArray,
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
}
