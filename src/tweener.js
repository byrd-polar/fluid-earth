import { tweened } from 'svelte/motion';

export default class Tweener {
  constructor(assignFn, options) {
    this._assignFn = assignFn;
    this._options = options;
  }

  async tween(oldVal, newVal) {
    let store = tweened(oldVal, this._options);
    store.subscribe(this._assignFn);
    await store.set(newVal);
  }
}
