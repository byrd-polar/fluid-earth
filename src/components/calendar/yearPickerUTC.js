import { clone } from './utility.js';

export const headerUnit = 'decade';

export function headerDate(date) {
  return new Date(Date.UTC(
    Math.floor(date.getUTCFullYear() / 10) * 10,
    0,
  ));
}

export function nextHeaderDate(headerDate) {
  return new Date(Date.UTC(
    headerDate.getUTCFullYear() + 10,
    0,
  ));
}

export function prevHeaderDate(headerDate) {
  return new Date(Date.UTC(
    headerDate.getUTCFullYear() - 10,
    0,
  ));
}

export function formatHeader(headerDate) {
  let end = new Date(Date.UTC(headerDate.getUTCFullYear() + 9, 0));
  return [headerDate, end].map(d => d.toLocaleString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
  })).join('-');
}

export const boxUnit = 'year';
export const boxDimensions = [2, 5];

export function boxDates(headerDate) {
  const years = Array.from({ length: 10 }, () => clone(headerDate));
  for (let i = 0; i < years.length; i++) {
    years[i].setUTCFullYear(headerDate.getUTCFullYear() + i);
  }
  return years;
}

export function boxDateEnabled(boxDate, headerDate) {
  return true;
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getUTCFullYear() === date.getUTCFullYear();
}

export function selectedDate(boxDate, date) {
  return new Date(Date.UTC(
    boxDate.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  ));
}

export function formatBox(boxDate) {
  return boxDate.toLocaleString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
  });
}
