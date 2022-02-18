import { basename } from 'path';
import { setTimeout as sleep } from 'timers/promises';
import { Worker } from 'worker_threads'

const DEFAULT_MINUTES_OF_SLEEP = 5;
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
    let minutes_of_sleep = DEFAULT_MINUTES_OF_SLEEP;
    this.#running.add(rabbit);

    try {
      await do_rabbit_things(
        rabbit,
        MINUTES_BEFORE_TIMEOUT,
        msg => minutes_of_sleep = msg ?? minutes_of_sleep,
      );
    } catch(error) {
      print_message(rabbit, error, minutes_of_sleep);
    }

    this.#running.delete(rabbit);
    this.#tick();

    await sleep(ms_from_minutes(minutes_of_sleep));
    this.#queued.push(rabbit);
    this.#tick();
  }
}

async function do_rabbit_things(module, time, handle_message) {
  await new Promise((resolve, reject) => {
    let worker = new Worker('./rabbit.js', { argv: [module] });
    let timeout = setTimeout(() => worker.terminate(), ms_from_minutes(time));
    worker.on('message', handle_message);
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

function print_message(module, error, minutes_of_sleep) {
  console.log([
    ...error.toString().split('\n'),
    `Retrying in ${minutes_of_sleep} minutes (at least)...`,
  ].map(str => `${basename(module, '.js')}: ${str}`).join('\n'));
}

function ms_from_minutes(minutes) {
  return 60_000 * minutes;
}
