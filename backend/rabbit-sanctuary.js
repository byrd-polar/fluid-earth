import { Worker } from 'worker_threads'
import { basename } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const MINUTES_BEFORE_RETRY = 5;
const MINUTES_BEFORE_TIMEOUT = 5;
const MAX_CONCURRENT_RABBITS = 8;

export class RabbitSanctuary {
  #all = new Set();
  #queued = [];
  #running = new Set();
  #doomed = new Set();

  add(...rabbits) {
    for (let rabbit of rabbits) {
      if (this.#all.has(rabbit)) {
        this.#doomed.delete(rabbit);

      } else {
        this.#all.add(rabbit);
        this.#queued.push(rabbit);
      }
    }
    this.#tick();
  }

  remove(rabbit) {
    if (this.#all.has(rabbit)) {
      this.#doomed.add(rabbit);
    }
  }

  #tick() {
    while (this.#running.size < MAX_CONCURRENT_RABBITS) {
      if (this.#queued.length === 0) break;

      let rabbit = this.#queued.shift();

      if (this.#doomed.has(rabbit)) {
        this.#all.delete(rabbit);
        this.#doomed.delete(rabbit);

      } else {
        this.#run(rabbit);
      }
    }
  }

  async #run(rabbit) {
    let sleep_time = 0;
    this.#running.add(rabbit);

    try {
      await do_rabbit_things(rabbit, MINUTES_BEFORE_TIMEOUT);

    } catch(error) {
      print_message(rabbit, error, MINUTES_BEFORE_RETRY);
      sleep_time = MINUTES_BEFORE_RETRY;
    }

    this.#running.delete(rabbit);
    this.#tick();

    await sleep(ms_from_minutes(sleep_time));
    this.#queued.push(rabbit);
    this.#tick();
  }
}

async function do_rabbit_things(module, time) {
  await new Promise((resolve, reject) => {
    let worker = new Worker('./rabbit.js', { argv: [module] });
    let timeout = setTimeout(() => worker.terminate(), ms_from_minutes(time));
    worker.on('error', reject);
    worker.on('exit', exitCode => {
      if (exitCode === 0) {
        clearTimeout(timeout);
        resolve();
      } else {
        reject(`Rabbit timed out after ${time} minutes`);
      }
    });
  });
}

function print_message(module, error, retry) {
  console.log([
    ...error.toString().split('\n'),
    `Retrying in ${retry} minutes (at least)...`,
  ].map(str => `${basename(module, '.js')}: ${str}`).join('\n'));
}

function ms_from_minutes(minutes) {
  return 60_000 * minutes;
}
