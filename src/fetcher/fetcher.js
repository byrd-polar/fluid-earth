import ky from 'ky';

export default class Fetcher {
  constructor() {
    this._downloadListeners = [];

    this._progressPerUrl = {};
    this._progressPerType = {};
    this._progressOverall = {};

    this._abortControllers = {};
    this._cache = {};
  }

  addDownloadListener(func) {
    this._downloadListeners.push(func);
  }

  async _fetch(url, type, abortPreviousOfType=true) {
    if (abortPreviousOfType) {
      this._abortControllers[type]?.abort();
      this._abortControllers[type] = new AbortController();
    }
    
    let cachedResponse = this._cache[url];
    if (cachedResponse) {
      return cachedResponse;
    }

    this._progressPerURL[url] = { type };

    let response = await ky(url, {
      signal: this._abortControllers[type].signal,
      onDownloadProgress: progress => {
        this._progressPerUrl[url].transferredBytes = progress.transferredBytes;
        this._progressPerUrl[url].totalBytes = progress.totalBytes;
        this._updateProgresses(type);
        this._triggerListeners();
      },
    }).finally(() => {
      delete this._progressPerURL[url];
      this._updateProgresses(type);
      this._triggerListeners();
    });

    this._cache[url] = response;
    return response;
  }

  _updateProgresses(type) {
    let progs = Object.values(this._progressPerUrl)
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
