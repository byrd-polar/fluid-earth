// intentionally not covering all the edge cases; wait for the Temporal API and
// then can get rid of all of this and maybe support more time zones
//
// not de-duplicating the following two functions because of laziness and cost
// to readability (mostly laziness)

export function add(date, duration) {
  let {
    milliseconds=0,
    seconds=0,
    minutes=0,
    hours=0,
    days=0,
    months=0,
    years=0,
  } = duration;

  let sum = new Date(
    date.getFullYear() + years,
    date.getMonth() + months,
    date.getDate() + days,
    date.getHours() + hours,
    date.getMinutes() + minutes,
    date.getSeconds() + seconds,
    date.getMilliseconds() + milliseconds,
  );

  let expectedMonth = (date.getMonth() + months + 12 * years) % 12;

  if ((years || months) && (sum.getMonth() !== expectedMonth)) {
    return add(date, {...duration, days: days - 1});
  }

  return sum;
}

export function addUTC(date, duration) {
  let {
    milliseconds=0,
    seconds=0,
    minutes=0,
    hours=0,
    days=0,
    months=0,
    years=0,
  } = duration;

  let sum = new Date(Date.UTC(
    date.getUTCFullYear() + years,
    date.getUTCMonth() + months,
    date.getUTCDate() + days,
    date.getUTCHours() + hours,
    date.getUTCMinutes() + minutes,
    date.getUTCSeconds() + seconds,
    date.getUTCMilliseconds() + milliseconds,
  ));

  let expectedMonth = (date.getUTCMonth() + months + 12 * years) % 12;

  if ((years || months) && (sum.getUTCMonth() !== expectedMonth)) {
    return add(date, {...duration, days: days - 1});
  }

  return sum;
}

export function clone(date) {
  return new Date(date.getTime());
}
