import { absolute_path } from './utility.js';
import { basename } from 'path';
import { setTimeout as sleep } from 'timers/promises';
import { Worker } from 'worker_threads'

const MINUTES_BEFORE_RETRY = 5;
const MINUTES_BEFORE_TIMEOUT = 5;

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
    while (this.#queued.length > 0) {
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
    let need_sleep = false;
    this.#running.add(rabbit);

    try {
      log(rabbit, 'Trying...');
      await do_rabbit_things(rabbit, MINUTES_BEFORE_TIMEOUT);

      log(rabbit, 'Success!');

    } catch(error) {
      need_sleep = true;

      let err_string = error?.stack
        ?? error?.toString()
        ?? 'Unknown error';

      for (let line of err_string.split('\n')) log(rabbit, line);
      log(rabbit, `Retrying in ${MINUTES_BEFORE_RETRY} minutes...`);
    }

    this.#running.delete(rabbit);
    this.#tick();

    if (need_sleep) await sleep(ms_from_minutes(MINUTES_BEFORE_RETRY));

    this.#queued.push(rabbit);
    this.#tick();
  }
}

async function do_rabbit_things(module, time) {
  await new Promise((resolve, reject) => {
    let worker = new Worker(absolute_path('./rabbit.js'), { argv: [module] });
    let timeout = reset_timeout(worker, time);
    worker.on('message', () => timeout = reset_timeout(worker, time, timeout));
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

function log(module, str) {
  console.log(`${basename(module, '.js')}: ${str}`);
}

function reset_timeout(worker, time, previous_timeout) {
  clearTimeout(previous_timeout);
  return setTimeout(() => worker.terminate(), ms_from_minutes(time));
}

function ms_from_minutes(minutes) {
  return 60_000 * minutes;
}
