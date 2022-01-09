import { Worker } from 'worker_threads'

runTaskOnRepeat('./datasets/rtgssthr-0p083.js');

async function runTaskOnRepeat(module) {
  let minutesToDelayAfterFailure = 5;
  let minutesBeforeTimeout = 5;

  while(true) {
    try {
      ({
        minutesToDelayAfterFailure=minutesToDelayAfterFailure,
        minutesBeforeTimeout=minutesBeforeTimeout,
      } = await import(module));
      await new Promise((resolve, reject) => {
        let worker = new Worker('./rabbit.js', {argv: [module] });
        worker.on('exit', resolve);
        worker.on('error', reject);
        setTimeoutInMinutes(reject, minutesBeforeTimeout);
      });
    } catch {
      await new Promise(resolve => {
        setTimeoutInMinutes(resolve, minutesToDelayAfterFailure);
      });
    }
  }
}

function setTimeoutInMinutes(func, minutes) {
  return setTimeout(func, 60 * 1000 * minutes);
}
