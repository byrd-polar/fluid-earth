import ky from 'ky';

export default class Fetcher {
  constructor() {
    this._downloadListeners = [];

    this._progressPerURL = {};
    this._progressPerType = {};
    this._progressOverall = {};

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

    this._progressPerURL[url] = { type };

    let buffer = await ky(url, {
      signal: this._abortControllers[type].signal,
      onDownloadProgress: progress => {
        this._progressPerURL[url].transferredBytes = progress.transferredBytes;
        this._progressPerURL[url].totalBytes = progress.totalBytes;
        this._updateProgresses(type);
        this._triggerListeners();
      },
    }).then(res => {
      let fileExtension = url.split('.').pop();
      return fileExtension === 'json' ? res.json() : res.arrayBuffer();

    }).finally(() => {
       delete this._progressPerURL[url];
       this._updateProgresses(type);
       this._triggerListeners();
    });

    this._cache[url] = buffer;
    return buffer;
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
        this._progressOverall, this._progressPerType, this._progressPerUrl
      );
    }
  }
}

function sumOverProp(array, prop) {
  return array.reduce((acc, curr) => acc + curr[prop], 0);
}
