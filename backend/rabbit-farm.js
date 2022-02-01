import { Worker } from 'worker_threads'
import { basename } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const MINUTES_BEFORE_RETRY = 5;
const MINUTES_BEFORE_TIMEOUT = 5;
const MAX_CONCURRENT_RABBITS = 8;

export class RabbitFarm {
  #queued = [];
  #running = new Set();

  add(...rabbits) {
    this.#queued.push(...rabbits);
    this.#tick();
  }

  #tick() {
    while (this.#running.size < MAX_CONCURRENT_RABBITS) {
      if (this.#queued.length === 0) break;

      let rabbit = this.#queued.shift();
      this.#run(rabbit);
      this.#running.add(rabbit);
    }
  }

  async #run(rabbit) {
    let sleep_time = 0;
    try {
      await runRabbit(rabbit, MINUTES_BEFORE_TIMEOUT);

    } catch(error) {
      printMessage(rabbit, error, MINUTES_BEFORE_RETRY);
      sleep_time = MINUTES_BEFORE_RETRY;

    } finally {
      this.#running.delete(rabbit);
      this.#tick();

      await sleep(msFromMinutes(sleep_time));
      this.#queued.push(rabbit);
      this.#tick();
    }
  }
}

async function runRabbit(module, time) {
  await new Promise((resolve, reject) => {
    let worker = new Worker('./rabbit.js', { argv: [module] });
    let timeout = setTimeout(() => worker.terminate(), msFromMinutes(time));
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

function printMessage(module, error, retry) {
  console.log([
    ...error.toString().split('\n'),
    `Retrying in ${retry} minutes (at least)...`,
  ].map(str => `${basename(module, '.js')}: ${str}`).join('\n'));
}

function msFromMinutes(minutes) {
  return 60_000 * minutes;
}
