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
  get name()         { return this.core.name ?? 'Empty dataset' }
  get path()         { return this.core.path ?? null }
  get width()        { return this.core.width ?? 1 }
  get height()       { return this.core.height ?? 1 }
  get start()        { return new Date(this.core.start ?? 0) }
  get end()          { return new Date(this.core.end ?? 0) }
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
}

export class GriddedDataset extends Dataset {
  get type()         { return 'gridded' }
  get colormap()     { return colormaps[this.core.colormap ?? 'VIRIDIS'] }
  get domain()       { return this.core.domain ?? [0, 1] }
  get unit()         { return this.core.unit ?? 'm' }
  get originalUnit() { return this.core.originalUnit ?? 'm' }

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

  async fetch(fetcher, date) {
    let buffer = await fetcher.fetch(this, date)
    if (!buffer) return this.emptyData

    return {
      floatArray: new Float16Array(buffer),
      ...this.dataProps,
    }
  }
}

export class ParticleDataset extends Dataset {
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
    uVelocities: emptyDataArray,
    vVelocities: emptyDataArray,
    ...new ParticleDataset().dataProps,
  }

  async fetch(fetcher, date) {
    let buffer = await fetcher.fetch(this, date)
    if (!buffer) return this.emptyData

    return {
      uVelocities: new Float16Array(buffer.slice(0, buffer.byteLength / 2)),
      vVelocities: new Float16Array(buffer.slice(buffer.byteLength / 2)),
      ...this.dataProps,
    }
  }
}
