import ky from 'ky';

// TODO: generate this as a JSON file from the data scripts
const fileSizeInBytes = {
  '/data/gfs-temperature.fp16': 2076480,
  '/data/gfs-u-wind.fp16': 2076480,
  '/data/gfs-v-wind.fp16': 2076480,
  '/data/gfs-wind-speed.fp16': 2076480,
  '/data/topology.json': 1207774,
};

export default class Fetcher {
  constructor() {
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
    if (abortPreviousOfType) {
      this._abortControllers[type]?.abort();
      this._abortControllers[type] = new AbortController();
    }

    let cachedResponse = this._cache[url];
    if (cachedResponse) {
      return cachedResponse;
    }

    this._progressPerURL[url] = {
      type,
      transferredBytes: 0,
      totalBytes: fileSizeInBytes[url],
    };

    let data;
    try {
      let res = await ky(url, {
        signal: this._abortControllers[type].signal,
        onDownloadProgress: prog => {
          this._progressPerURL[url].transferredBytes = prog.transferredBytes;
          this._updateProgresses(type);
          this._triggerListeners();
          this._resetIfComplete();
        },
      });
      let ext = url.split('.').pop();
      data = await (ext === 'json' ? res.json() : res.arrayBuffer());

    } catch (error) {
      delete this._progressPerURL[url];

      // Chromium returns a TypeError on abort for some reason
      if (error.name === 'AbortError' || error.name === 'TypeError') {
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
