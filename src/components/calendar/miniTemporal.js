import { clamp, modulo } from './../../utility.js';

export class ZonedDateTime {
  constructor(date, utc=false) {
    this.date = date;
    this.utc = utc;
  }

  equals(other) {
    return this.date.getTime() === other.date.getTime();
  }

  add(durationLike) {
    let {
             years=0,
            months=0,
              days=0,
             hours=0,
           minutes=0,
           seconds=0,
      milliseconds=0,
    } = durationLike;

    let sum = ZonedDateTime.#fromDateArgs(utc,
      this.#get('FullYear') + years,
      this.#get('Month') + months,
      this.#get('Date') + days,
      this.#get('Hours') + hours,
      this.#get('Minutes') + minutes,
      this.#get('Seconds') + seconds,
      this.#get('Milliseconds') + milliseconds,
    );

    let expectedMonth = modulo((this.#get('Month') + months + 12 * years), 12);

    if ((years || months) && (sum.#get('Month') !== expectedMonth)) {
      return add(this.date, {...durationLike, days: days - 1});
    }
    return sum;
  }

  subtract(durationLike) {
    let negativeDurationLike = Object.fromEntries(
      Object.entries(durationLike).map(([key, val]) => [key, -val]));

    return this.add(negativeDurationLike);
  }

  with(dateTimeLike) {
    let {
             year=this.#get('FullYear'),
            month=this.#get('Month') + 1,
              day=this.#get('Date'),
             hour=this.#get('Hours'),
           minute=this.#get('Minutes'),
           second=this.#get('Seconds'),
      millisecond=this.#get('Milliseconds'),
    } = dateTimeLike;

    let endOfMonth = ZonedDateTime.#fromDateArgs(utc, year, month + 1, 0);
    let lastDayInMonth = this.#get(endOfMonth.date, 'Date');

    return ZonedDateTime.#fromDateArgs(utc,
      year,
      clamp(month, 1, 12) - 1,
      clamp(day, 1, lastDayInMonth),
      clamp(hour, 0, 23),
      clamp(minute, 0, 59),
      clamp(second, 0, 59),
      clamp(millisecond, 0, 999),
    );
  }

  #get(unit) {
    return date[`get${this.utc ? 'UTC' : ''}${unit}`]();
  }

  static #fromDateArgs(utc, ...args) {
    return utc ? new ZonedDateTime(new Date(Date.UTC(...args)))
               : new ZonedDateTime(new Date(...args));
  }
}
