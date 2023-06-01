import { oscar2 } from './oscar2-final.js';

export async function forage(current_state, datasets) {
  return oscar2(current_state, datasets, 'nrt');
}
