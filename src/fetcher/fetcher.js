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

    let data;
    try {
      let res = await ky(url, {
        signal: this._abortControllers[type].signal,
        onDownloadProgress: prog => {
          this._progressPerURL[url].transferredBytes = prog.transferredBytes;
          this._progressPerURL[url].totalBytes = prog.totalBytes;
          this._updateProgresses(type);
          this._triggerListeners();
        },
      });
      let ext = url.split('.').pop();
      data = await (ext === 'json' ? res.json() : res.arrayBuffer());

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
      return false;

    } finally {
      delete this._progressPerURL[url];
      this._updateProgresses(type);
      this._triggerListeners();
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
        this._progressOverall, this._progressPerType, this._progressPerUrl
      );
    }
  }
}

function sumOverProp(array, prop) {
  return array.reduce((acc, curr) => acc + curr[prop], 0);
}
