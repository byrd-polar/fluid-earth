import colormaps from './map/colormaps/index.js';
import dataProjections from './map/data-projections/index.js';

class Dataset {
  constructor(core)  { this.core = core ?? {} }
  get name()         { return this.core.name ?? 'Empty dataset' }
  get path()         { return this.core.path ?? null }
  get width()        { return this.core.width ?? 0 }
  get height()       { return this.core.height ?? 0 }
  get start()        { return new Date(this.core.start ?? 0) }
  get end()          { return new Date(this.core.end ?? 0) }
  get missing()      { return (this.core.missing ?? []).map(d => new Date(d)) }
  get interval()     { return this.core.intervalInHours ?? 1 }
  get projection()   { return dataProjections[this.core.projection ?? 'GFS'] }
  get bytesPerFile() { return this.width * this.height * 2 }
}

export class GriddedDataset extends Dataset {
  get type()         { return 'gridded' }
  get colormap()     { return colormaps[this.core.colormap ?? 'VIRIDIS'] }
  get domain()       { return this.core.domain ?? [0, 1] }
  get unit()         { return this.core.unit ?? 'm' }
  get originalUnit() { return this.core.originalUnit ?? 'm' }
}

export class ParticleDataset extends Dataset {
  get type()             { return 'particle' }
  get particleLifetime() { return this.core.particleLifetime ?? 0 }
  get particleCount()    { return this.core.particleCount ?? 0 }
  get particleDisplay()  { return this.core.particleDisplay ?? zeroProxy }
  get bytesPerFile()     { return this.width * this.height * 4 }
}

const zeroProxy = new Proxy({}, { get() { return 0 } });
