import { clamp, modulo } from './../../utility.js';

export class BabyTemporal {
  constructor(date) {
    this.date = date;
  }

  equals(other) {
    return this.date.getTime() === other.date.getTime();
  }

  add(durationLike, utc=true) {
    let {
             years=0,
            months=0,
              days=0,
             hours=0,
           minutes=0,
           seconds=0,
      milliseconds=0,
    } = durationLike;

    let sum = newObj(utc,
      get(utc, this.date, 'FullYear') + years,
      get(utc, this.date, 'Month') + months,
      get(utc, this.date, 'Date') + days,
      get(utc, this.date, 'Hours') + hours,
      get(utc, this.date, 'Minutes') + minutes,
      get(utc, this.date, 'Seconds') + seconds,
      get(utc, this.date, 'Milliseconds') + milliseconds,
    );

    let expectedMonth = modulo(
      (get(utc, this.date, 'Month') + months + 12 * years), 12);

    if ((years || months) && (get(utc, sum.date, 'Month') !== expectedMonth)) {
      return add(this.date, {...durationLike, days: days - 1}, utc);
    }
    return sum;
  }

  subtract(durationLike, utc=true) {
    let negativeDurationLike = Object.fromEntries(
      Object.entries(durationLike).map(([key, val]) => [key, -val]));

    return this.add(negativeDurationLike, utc);
  }

  with(dateTimeLike, utc=true) {
    let {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
    } = {
      ...this.toDateTimeLike(utc, false),
      ...dateTimeLike,
    };

    let lastDayInMonth = get(utc, newObj(utc, year, month + 1, 0).date, 'Date');

    return newObj(utc,
      year,
      clamp(month, 1, 12) - 1,
      clamp(day, 1, lastDayInMonth),
      clamp(hour, 0, 23),
      clamp(minute, 0, 59),
      clamp(second, 0, 59),
      clamp(millisecond, 0, 999),
    );
  }

  truncate(smallestUnit, utc=true) {
    let dateTimeLike = this.toDateTimeLike(utc);
    for (let unit of Object.keys(dateTimeLike)) {
      if (unit === smallestUnit) break;

      dateTimeLike[unit] = 0;
    }
    return this.with(dateTimeLike, utc);
  }

  toDateTimeLike(utc=true, simplify=true) {
    let dateTimeLike = {
      millisecond: get(utc, this.date, 'Milliseconds'),
           second: get(utc, this.date, 'Seconds'),
           minute: get(utc, this.date, 'Minutes'),
             hour: get(utc, this.date, 'Hours'),
              day: get(utc, this.date, 'Date'),
            month: get(utc, this.date, 'Month') + 1,
             year: get(utc, this.date, 'FullYear'),
    };

    if (!simplify) return dateTimeLike;

    for (let [unit, value] of Object.entries(dateTimeLike)) {
      if (value !== defaultValues[unit]) continue;

      delete dateTimeLike[unit];
    }
    return dateTimeLike;
  }
}

function newObj(utc, ...args) {
  return utc ? new BabyTemporal(new Date(Date.UTC(...args)))
             : new BabyTemporal(new Date(...args));
}

function get(utc, date, unit) {
  return date[`get${utc ? 'UTC' : ''}${unit}`]();
}

const defaultValues = {
  year: NaN,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
};
