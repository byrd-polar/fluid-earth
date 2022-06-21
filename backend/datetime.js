import { ZonedDateTime } from '../src/temporal.js';
import { nextOscarDate } from '../src/oscar.js';

export class Datetime extends ZonedDateTime {
  static now() {
    return new this(new Date(), true);
  }

  static from(iso_string) {
    return new this(new Date(iso_string), true);
  }

  static next_oscar_date(iso_string) {
    return new this(nextOscarDate(new Date(iso_string)), true);
  }

  get p_month() {
    return this.#get_padded('month');
  }

  get p_day() {
    return this.#get_padded('day');
  }

  get p_hour() {
    return this.#get_padded('hour');
  }

  to_iso_string() {
    return this.date.toISOString();
  }

  days_since(datetime) {
    return (this.date - datetime.date) / (1000 * 60 * 60 * 24);
  }

  valueOf() {
    return this.date.getTime();
  }

  #get_padded(unit, length=2) {
    return this[unit].toString().padStart(length, '0');
  }
}
