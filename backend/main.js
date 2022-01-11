import { Worker } from 'worker_threads'
import { basename } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const MINUTES_BEFORE_RETRY = 5;
const MINUTES_BEFORE_TIMEOUT = 5;

runRabbitOnRepeat('./datasets/rtgssthr-0p083.js');

async function runRabbitOnRepeat(module) {
  while(true) {
    try {
      await runRabbit(module, MINUTES_BEFORE_TIMEOUT);

    } catch(error) {
      printMessage(module, error, MINUTES_BEFORE_RETRY);
      await sleep(msFromMinutes(MINUTES_BEFORE_RETRY));
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
    `Retrying in ${retry} minutes...`,
  ].map(str => `${basename(module, '.js')}: ${str}`).join('\n'));
}

function msFromMinutes(minutes) {
  return 60_000 * minutes;
}
