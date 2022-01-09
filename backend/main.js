import { Worker } from 'worker_threads'
import { basename } from 'path';

runRabbitOnRepeat('./datasets/rtgssthr-0p083.js');

async function runRabbitOnRepeat(module) {
  while(true) {
    try {
      var { minutesBeforeTimeout, minutesBeforeRetry } = await import(module);
      await runRabbit(module, minutesBeforeTimeout ?? 5);
    } catch(error) {
      minutesBeforeRetry ??= 5;
      printMessage(module, error, minutesBeforeRetry);
      await sleep(minutesBeforeRetry);
    }
  }
}

async function runRabbit(module, time) {
  await new Promise((resolve, reject) => {
    let worker = new Worker('./rabbit.js', { argv: [module] });
    let timeout = setTimeoutInMinutes(() => worker.terminate(), time);
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

async function sleep(minutes) {
  await new Promise(resolve => setTimeoutInMinutes(resolve, minutes));
}

function setTimeoutInMinutes(func, minutes) {
  return setTimeout(func, 60 * 1000 * minutes);
}
