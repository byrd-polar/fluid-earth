import ky from 'ky';
import { Float16Array } from '@petamoriken/float16';

export default class Fetcher {
  constructor(inventory) {
    this.inventory = inventory;

    this._downloadListeners = [];

    this._progressPerURL = {};
    this._progressPerType = {};
    this._progressOverall = {};

    this._completedURLs = [];

    this._abortControllers = {};
    this._cache = {};
  }

  addDownloadListener(func) {
    this._downloadListeners.push(func);
  }

  async fetch(url, type='default', abortPreviousOfType=true) {
    // workaround for ':' being an illegal character for filenames on Windows,
    // __windows__ will be replaced by rollup
    if (__windows__) {
      url = url.replace(/:/g, '_');
    }

    if (abortPreviousOfType) {
      if (this._abortControllers[type]) {
        this._abortControllers[type].abort();
      }
      this._abortControllers[type] = new AbortController();
    }

    let cachedResponse = this._cache[url];
    if (cachedResponse) {
      return cachedResponse;
    }

    this._progressPerURL[url] = {
      type,
      transferredBytes: 0,
      totalBytes: await this._fileSizeInBytes(url),
    };

    let data;
    try {
      let res = await ky(url, {
        signal: this._abortControllers[type].signal,
        onDownloadProgress: prog => {
          if (!this._progressPerURL[url]) return;

          this._progressPerURL[url].transferredBytes = prog.transferredBytes;
          this._updateProgresses(type);
          this._triggerListeners();
          this._resetIfComplete();
        },
      });
      if (url.split('.').pop() === 'json') {
        data = await res.json();
      } else {
        // TODO: find reliable detection for iOS <= 12
        if (false) {
          let temp = new Float16Array(await res.arrayBuffer());
          data = new Float32Array(temp.length);

          // TODO: Move the following loop to a Web Worker so it doesn't block
          // the main thread. Will also want to add an additional loading
          // indicator.
          //
          // Intereseting side-effect on an iPhone 6 is that processing all
          // these floats causes the particles to flicker afterwards (some sort
          // of optimization attempt?), which is fixed after switching to
          // another tab and back. When less particles are used, or f32 files
          // are loaded directly without conversion, the flickering doesn't
          // happen. The hope is the Web Worker will fix that as well.

          // convert from Float16s to Float32s
          for (let i = 0; i < data.length; i++) {
            data[i] = temp[i];
          }
        } else {
          data = new Float16Array(await res.arrayBuffer());
        }
      }

    } catch (error) {
      delete this._progressPerURL[url];

      this._updateProgresses(type);
      this._triggerListeners();
      this._resetIfComplete();

      if (error.name === 'AbortError') {
        console.log('Fetch aborted:', url);
        console.log(
          'Ignore the surrounding errors (if any), please. AbortController',
          '(experimental web API) throws some weird errors sometimes but the',
          'desired behavior seems to work regardless.'
        );
      } else {
        console.error('Fetch error:', error);
      }
      return false;
    }

    this._cache[url] = data;
    return data;
  }

  async _fileSizeInBytes(url) {
    let bytes;
    if (this.inventory[url]) {
      bytes = this.inventory[url].bytes;
    } else {
      let dir = url.split('/').slice(0, -1).join('/') + '/';
      bytes = this.inventory[dir].bytesPerFile;
    }
    return bytes;
  }

  _updateProgresses(type) {
    let progs = Object.values(this._progressPerURL)
      .filter(p => p.type === type);
    this._progressPerType[type] = {
      transferredBytes: sumOverProp(progs, 'transferredBytes'),
      totalBytes: sumOverProp(progs, 'totalBytes'),
    };

    progs = Object.values(this._progressPerType);
    this._progressOverall = {
      transferredBytes: sumOverProp(progs, 'transferredBytes'),
      totalBytes: sumOverProp(progs, 'totalBytes'),
    };
  }

  _triggerListeners() {
    for (const listener of this._downloadListeners) {
      listener(
        this._progressOverall, this._progressPerType, this._progressPerURL
      );
    }
  }

  _resetIfComplete() {
    if (this._progressOverall.transferredBytes ===
        this._progressOverall.totalBytes) {
      this._progressPerURL = {};
      this._progressPerType = {};
      this._progressOverall = {};
    }
  }
}

function sumOverProp(array, prop) {
  return array.reduce((acc, curr) => acc + curr[prop], 0);
}
