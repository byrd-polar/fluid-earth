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

All inventory files are a JSON array of `dataset`s. There are three types of
`dataset`s, differentiated by their keys, Extra keys not listed here may exist
for ease of programming on the backend and are ignored by the frontend.

#### Keys shared by all `dataset`s

key | value type | meaning | example
--- | ---------- | ------- | -------
`name` | string | a short phrase fully describing the data | `"temperature at 2 m above ground"`

#### Keys shared by particle and gridded `dataset`s

key | value type | meaning | example
`bytesPerFile` |
`width` |
`height` |
`intervalInHours` |
`projection` |
`start` |
`end` |
`lastForecast` |

#### Gridded `dataset`s

key | value type | meaning | example
--- | ---------- | ------- | -------
`path` | string | absolute path of the data directory | `"/data/gfs-0p25-temperature-2-m-above-ground/"`
`unit` |
`originalUnit` |
`domain` |
`colormap` |

#### Particle `dataset`s

key | value type | meaning | example
--- | ---------- | ------- | -------
`uPath` | string | absolute path of the `u` velocity data directory | `"/data/gfs-0p25-u-wind-velocity-10-m-above-ground/"`
`vPath` | string | absolute path of the `v` velocity data directory | `"/data/gfs-0p25-v-wind-velocity-10-m-above-ground/"`
`particleLifetime` |
`particleCount` |
`particleDisplay` |
`particleDisplay.size` |
`particleDisplay.rate` |
`particleDisplay.opacity` |
`particleDisplay.opacitySpeedDecay` |
`particleDisplay.fade` |
`particleDisplay.fade` |

#### Topology `dataset`s

key | value type | meaning | example
--- | ---------- | ------- | -------
`lastUpdated` | ISO date | the last time the data source updated | `"2018-05-21"`
`bytes` | integer | size of the file, in bytes | `1207774`
