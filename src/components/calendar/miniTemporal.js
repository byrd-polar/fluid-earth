import { clamp, modulo } from './../../math.js';

export class ZonedDateTime {
  constructor(date, utc=false) {
    this._date = new Date(date);
    this._utc = utc;
  }

  get date() {
    return new Date(this._date);
  }

  get daysInMonth() {
    return this._daysInMonth(this.year, this.month);
  }

  get year()        { return this._get('FullYear'); }
  get month()       { return this._get('Month') + 1; }
  get day()         { return this._get('Date'); }
  get hour()        { return this._get('Hours'); }
  get minute()      { return this._get('Minutes'); }
  get second()      { return this._get('Seconds'); }
  get millisecond() { return this._get('Milliseconds'); }

  equals(other) {
    return this._date.getTime() === other._date.getTime();
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

    return this._fromDateArgs(
      year,
      clamp(month, 1, 12) - 1,
      clamp(day, 1, this._daysInMonth(year, month)),
      clamp(hour, 0, 23),
      clamp(minute, 0, 59),
      clamp(second, 0, 59),
      clamp(millisecond, 0, 999),
    );
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

    let sum = this._fromDateArgs(
      this.year + years,
      this.month - 1 + months,
      this.day + days,
      this.hour + hours,
      this.minute + minutes,
      this.second + seconds,
      this.millisecond + milliseconds,
    );

    let expectedMonth = modulo((this.month - 1 + months + 12 * years), 12) + 1;

    if ((years || months) && (sum.month !== expectedMonth)) {
      return this.add({...durationLike, days: days - 1});
    }
    return sum;
  }

  subtract(durationLike) {
    let negativeDurationLike = Object.fromEntries(
      Object.entries(durationLike).map(([key, val]) => [key, -val]));

    return this.add(negativeDurationLike);
  }

  _get(unit) {
    return this._date[`get${this._utc ? 'UTC' : ''}${unit}`]();
  }

  _daysInMonth(year, month) {
    return this._fromDateArgs(year, month, 0).day;
  }

  _fromDateArgs(...args) {
    return this._utc ? new ZonedDateTime(new Date(Date.UTC(...args)))
                     : new ZonedDateTime(new Date(...args));
  }
}
