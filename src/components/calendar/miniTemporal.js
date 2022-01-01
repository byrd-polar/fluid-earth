import { clamp, modulo } from './../../utility.js';

export class ZonedDateTime {
  constructor(date, utc=false) {
    this.date = date;
    this.utc = utc;
  }

  get year()        { return this.#get('FullYear'); }
  get month()       { return this.#get('Month') + 1; }
  get day()         { return this.#get('Date'); }
  get hour()        { return this.#get('Hours'); }
  get minute()      { return this.#get('Minutes'); }
  get second()      { return this.#get('Seconds'); }
  get millisecond() { return this.#get('Milliseconds'); }

  #get(unit) {
    return date[`get${this.utc ? 'UTC' : ''}${unit}`]();
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
      this.year + years,
      this.month + months,
      this.day + days,
      this.hour + hours,
      this.minute + minutes,
      this.second + seconds,
      this.millisecond + milliseconds,
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
             year=this.year,
            month=this.month,
              day=this.day,
             hour=this.hour,
           minute=this.minute,
           second=this.second,
      millisecond=this.millisecond,
    } = dateTimeLike;

    let maxDay = ZonedDateTime.#fromDateArgs(utc, year, month + 1, 0).day;

    return ZonedDateTime.#fromDateArgs(utc,
      year,
      clamp(month, 1, 12) - 1,
      clamp(day, 1, maxDay),
      clamp(hour, 0, 23),
      clamp(minute, 0, 59),
      clamp(second, 0, 59),
      clamp(millisecond, 0, 999),
    );
  }

  static #fromDateArgs(utc, ...args) {
    return utc ? new ZonedDateTime(new Date(Date.UTC(...args)))
               : new ZonedDateTime(new Date(...args));
  }
}
