import { ZonedDateTime } from '../src/components/calendar/miniTemporal.js';

export class Datetime extends ZonedDateTime {
  static now() {
    return new this(new Date(), true);
  }

  static from(iso_string) {
    return new this(new Date(iso_string), true);
  }

  get padded_month() {
    return this.#get_padded('month');
  }

  get padded_day() {
    return this.#get_padded('day');
  }

  to_iso_string() {
    return this.date.toISOString();
  }

  #get_padded(unit, length=2) {
    return this[unit].toString().padStart(length, '0');
  }
}
