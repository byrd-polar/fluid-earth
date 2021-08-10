# Static file generation backend

The code in this directory is responsible for generating the data (`.fp16`) and
inventory (`.json`) files under the `public/data` directory, which is symlinked
to `dist/data` during the build step. Each data source (e.g. GFS, GEOS) has a
single `.js` file that is responsible for reading its existing inventory file,
downloading new data, then updating its inventory the main inventory files
accordingly.

## File formats

### Data files (`.fp16`)

These are raw binary files containing only
[`fp16`](https://github.com/petamoriken/float16/) values. All metadata is
contained in `public/data/inventory.json`.

### Inventory files(`.json`)

All inventory files are a JSON array of `datasets`. There are three types of
`datasets`, differentiated by their keys, Extra keys not listed here may exist
for ease of programming on the backend and are ignored by the frontend.

#### Shared by all `datasets`

key | value type | meaning | example
--- | ---------- | ------- | -------
`name` | string | a short phrase fully describing the data | `"temperature at 2 m above ground"`

#### Shared by particle and gridded `datasets`

key | value type | meaning | example
--- | ---------- | ------- | -------
`bytesPerFile` | integer | size of each `.fp16` file in data directory | `2076480`
`width` | integer | horizontal/longitude dimension of data | `1440`
`height` | integer | vertical/latitude dimension of data | `721`
`intervalInHours` | integer or `custom:*` string | number of hours between each data file | `1` or `"custom:OSCAR"`
`projection` | `dataProjection` string (see `/src/map/data-projections/index.js`) | `"GFS"`
`start` | ISO date string | filename, excluding `.fp16` extension, of earliest data | `"2021-07-03T12:00:00.000Z"`
`end` | ISO date string | filename, excluding `.fp16` extension, of most future data | `"2021-07-03T21:00:00.000Z"`
`lastForecast` | ISO date string | starting time of latest forecast | `"2021-07-03T12:00:00.000Z"`

#### Gridded `datasets` only

key | value type | meaning | example
--- | ---------- | ------- | -------
`path` | path string | absolute path of data directory | `"/data/gfs-0p25-temperature-2-m-above-ground/"`
`unit` | `unit` string (from `js-quantities` library) | default display unit of measurement | `"tempC"`
`originalUnit` | `unit` string (from `js-quantities` library) | in the `.fp16` files, unit of measurement data is in | `"tempK"`
`domain` | length-2 array of floats | minimum and max values, in term of `originalUnit`, to display | `[193.14999999999998, 328.15]`
`colormap` | `colormap` string (see `/src/map/colormaps/index.js`) | how to convert values to colors for display | `"VIRIDIS"`

#### Particle `datasets` only

key | value type | meaning | example
--- | ---------- | ------- | -------
`uPath` | path string | absolute path of `u` velocity data directory | `"/data/gfs-0p25-u-wind-velocity-10-m-above-ground/"`
`vPath` | path string | absolute path of `v` velocity data directory | `"/data/gfs-0p25-v-wind-velocity-10-m-above-ground/"`
`particleLifetime` | float | how long, in milliseconds, before a particle is relocated on map | `2000`
`particleCount` | integer | total number of particles simulated at any time | `1e5`
`particleDisplay` | object (see rows below) | various ways to affect particle (trail) rendering | ```
{
  "size": 0.8,
  "rate": 25000,
  "opacity": 0.3,
  "opacitySpeedDecay": 0.8,
  "fade": 0.98
}
```
(see rows below)
`particleDisplay.size` | float | at 1 zoom, diameter of the particle in CSS pixels | `0.8`
`particleDisplay.rate` | float | how many times faster than reality the particles move across the globe | `25000`
`particleDisplay.opacity` | float | from 0 to 1, a base for opaque the particles are | `0.3`
`particleDisplay.opacitySpeedDecay` | float | scale for how transparent slower-moving particles are | `0.8`
`particleDisplay.fade` | float | from 0 to 1, how slow the particle trail goes to 0 opacity | `0.98`

#### Topology `datasets` only

key | value type | meaning | example
--- | ---------- | ------- | -------
`lastUpdated` | ISO date string | when data source was last modified | `"2018-05-21"`
`bytes` | integer | size of file, in bytes | `1207774`
