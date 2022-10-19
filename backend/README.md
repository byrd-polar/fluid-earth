# Static file generation backend

The code in this directory is responsible for generating the data (`.fp16.br`)
files and inventory (`inventory.json.br`) file under the `public/tera`
directory, which is symlinked to `dist/tera` during the build step. Each data
`source` (e.g. GFS, GEOS) has a single `.js` file with a `forage` function that
recieves the source's current `state`, creating new data files based on that
state, then returning the new `state`.

## File formats

### Data files (`.fp16.br`)

These are raw binary files containing only
[`fp16`](https://github.com/petamoriken/float16/) values compressed with
[Brotli](https://developer.mozilla.org/en-US/docs/Glossary/brotli_compression).
All metadata is contained in `public/data/inventory.json.br`.

### Inventory file (`inventory.json.br`)

The inventory file is a JSON array of `datasets`. There are two types of
`datasets`, differentiated by their keys.

#### Shared by both `datasets`

key | value type | meaning | example
--- | ---------- | ------- | -------
`name` | string | a short phrase fully describing the data | `"temperature at 2 m above ground"`
`path` | path string | absolute path of data directory | `"/data/gfs-0p25-temperature-2-m-above-ground/"`
`width` | integer | horizontal/longitude dimension of data | `1440`
`height` | integer | vertical/latitude dimension of data | `721`
`interval` | string | time between each data file (see `/src/intervals.js`) | `hourly`
`projection` | `dataProjection` string (see `/src/map/data-projections/index.js`) | conversion between row/col and lat/lon | `"GFS"`
`start` | ISO date string | filename, excluding `.fp16.br` extension, of earliest data | `"2021-07-03T12:00:00.000Z"`
`end` | ISO date string | filename, excluding `.fp16.br` extension, of most future data | `"2021-07-03T21:00:00.000Z"`

#### Gridded `datasets` only

key | value type | meaning | example
--- | ---------- | ------- | -------
`unit` | `unit` string (from `js-quantities` library) | default display unit of measurement | `"tempC"`
`originalUnit` | `unit` string (from `js-quantities` library) | in the `.fp16.br` files, unit of measurement data is in | `"tempK"`
`domain` | length-2 array of floats | minimum and max values, in term of `originalUnit`, to display | `[193.14999999999998, 328.15]`
`colormap` | `colormap` string (see `/src/map/colormaps/index.js`) | how to convert values to colors for display | `"VIRIDIS"`

#### Particle `datasets` only

key | value type | meaning | example
--- | ---------- | ------- | -------
`particleLifetime` | float | how long, in milliseconds, before a particle is relocated on map | `2000`
`particleCount` | integer | total number of particles simulated at any time | `1e5`
`particleDisplay` | object (see rows below) | various ways to affect particle (trail) rendering | `{...}` (see rows below)
`particleDisplay.size` | float | at 1 zoom, diameter of the particle in CSS pixels | `0.8`
`particleDisplay.rate` | float | how many times faster than reality the particles move across the globe | `25000`
`particleDisplay.opacity` | float | from 0 to 1, a base for opaque the particles are | `0.3`
`particleDisplay.opacitySpeedDecay` | float | scale for how transparent slower-moving particles are | `0.8`
`particleDisplay.fade` | float | from 0 to 1, how slow the particle trail goes to 0 opacity | `0.98`
