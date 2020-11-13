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
      onDownloadProgress: (progress, _chunk) => {
        this._updateProgresses(url, type, progress);
        for (const listener of this._downloadListeners) {
          listener(
            this._progressPerUrl,
            this._progressPerType,
            this._progressOverall,
          );
        }
      },
    }).finally(() => delete this._progressPerURL[url]);

    this._cache[url] = response;
    return response;
  }

  _updateProgresses(url, type, progress) {
    this._progressPerUrl[url].transferredBytes = progress.transferredBytes;
    this._progressPerUrl[url].totalBytes = progress.totalBytes;

    let progs = Object.values(this._progressPerUrl)
      .filter(p => p.type === type);
    let trans = progs.reduce((acc, curr) => acc + curr.transferredBytes, 0);
    let total = progs.reduce((acc, curr) => acc + curr.totalBytes, 0);

    this._progressPerType[type] = {
      transferredBytes: trans,
      totalBytes: total,
    };

    progs = Object.values(this._progressPerType);
    trans = progs.reduce((acc, curr) => acc + curr.transferredBytes, 0);
    total = progs.reduce((acc, curr) => acc + curr.totalBytes, 0);

    this._progressOverall = {
      transferredBytes: trans,
      totalBytes: total,
    };
  }
}
