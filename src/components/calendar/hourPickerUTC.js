import { addUTC, clone } from './utility.js';

export const headerUnit = 'day';

export function headerDate(date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
}

export function nextHeaderDate(headerDate) {
  return addUTC(headerDate, { days: 1 });
}

export function prevHeaderDate(headerDate) {
  return addUTC(headerDate, { days: -1 });
}

export function formatHeader(headerDate) {
  return headerDate.toLocaleString(undefined, {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
    day: 'numeric',
  });
}

export const boxUnit = 'hour';
export const boxDimensions = [4, 6];

export function boxDates(headerDate) {
  const hours = Array.from({ length: 24 }, () => clone(headerDate));
  for (let i = 0; i < hours.length; i++) hours[i].setUTCHours(i);
  return hours;
}

export function boxDateEnabled(boxDate, headerDate) {
  return true;
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getUTCFullYear() === date.getUTCFullYear()
      && boxDate.getUTCMonth()    === date.getUTCMonth()
      && boxDate.getUTCDate()     === date.getUTCDate()
      && boxDate.getUTCHours()    === date.getUTCHours();
}

export function selectedDate(boxDate, date) {
  return new Date(Date.UTC(
    boxDate.getUTCFullYear(),
    boxDate.getUTCMonth(),
    boxDate.getUTCDate(),
    boxDate.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  ));
}

export function formatBox(boxDate) {
  return boxDate.toLocaleString(undefined, {
    timeZone: 'UTC',
    hour12: false,
    hour: 'numeric',
    minute: '2-digit',
  });
}
