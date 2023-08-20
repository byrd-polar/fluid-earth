#!/bin/env -S deno run --allow-write --allow-net --no-npm

// Make backend/state have the same content as backend/state on the prod server

let response = await fetch('https://fluid-earth.byrd.osu.edu/tera/state.json');
let state = await response.json();

try {
  await Deno.remove('./backend/state', { recursive: true });
} catch(err) {
  if (!(err instanceof Deno.errors.NotFound)) throw err;
}
await Deno.mkdir('./backend/state')

for (const dir in state) {
  await Deno.mkdir(`./backend/state/${dir}`);

  for (const file in state[dir]) {
    await Deno.writeTextFile(
      `./backend/state/${dir}/${file}.json`,
      JSON.stringify(state[dir][file], null, 2)
    );
  }
}
