import { ZonedDateTime } from '../src/components/calendar/miniTemporal.js';
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

  get padded_month() {
    return this.#get_padded('month');
  }

  get padded_day() {
    return this.#get_padded('day');
  }

  to_iso_string() {
    return this.date.toISOString();
  }

  days_since(datetime) {
    return (this.date - datetime.date) / (1000 * 60 * 60 * 24);
  }

  #get_padded(unit, length=2) {
    return this[unit].toString().padStart(length, '0');
  }
}
