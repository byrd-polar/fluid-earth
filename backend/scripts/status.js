#!/bin/env -S deno run --allow-net --no-npm

const tera_url = 'https://fluid-earth.byrd.osu.edu/tera/';

const minutes = 60 * 1000;
const hours = 60 * minutes;
const days = 24 * hours;

class Up {
  now = new Date();
  down = false;

  assert(obj, prop, max_delay, message) {
    if (this.now - new Date(obj[prop]) > max_delay) {
      console.log(`\n${message}.`);
      console.log(obj);
      this.down = true;
    }
  }
}

async function get(filename) {
  let response = await fetch(tera_url + filename);
  return response.json();
}

const up = new Up();

console.log(`Checking status of ${tera_url} ...`);

let heart = await get('heart.json');
let state = await get('state.json');

up.assert(
  heart, 'last_beat',
  5 * minutes, 'Tera is down',
);
up.assert(
  state.sources.geos, 'forecast',
  18 * hours, 'GEOS is delayed',
  true,
);
up.assert(
  state.sources.gfs, 'forecast',
  11 * hours, 'GFS is delayed',
);
up.assert(
  state.sources.gfswave, 'forecast',
  11 * hours, 'GFS-wave is delayed',
);
up.assert(
  state.sources['oscar2-nrt'], 'date',
  6 * days, 'OSCAR2 is delayed',
);
up.assert(
  state.sources.rtgssthr, 'date',
  47 * hours, 'RTGSSTHR is delayed',
);
up.assert(
  state.sources.era5monthly, 'date',
  70 * days, 'ERA5-monthly is delayed',
  true,
);

if (!up.down) console.log('\nAll sources up to date.');
