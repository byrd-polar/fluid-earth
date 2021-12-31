import { addUTC, clone } from './utility.js';

export const headerUnit = 'year';

export function headerDate(date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    0,
  ));
}

export function nextHeaderDate(headerDate) {
  return addUTC(headerDate, { years: 1 });
}

export function prevHeaderDate(headerDate) {
  return addUTC(headerDate, { years: -1 });
}

export function formatHeader(headerDate) {
  return headerDate.toLocaleString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
  });
}

export const boxUnit = 'month';
export const boxDimensions = [3, 4];

export function boxDates(headerDate) {
  const months = Array.from({ length: 12 }, () => clone(headerDate));
  for (let i = 0; i < months.length; i++) months[i].setUTCMonth(i);
  return months;
}

export function boxDateEnabled(boxDate, headerDate) {
  return true;
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getUTCFullYear() === date.getUTCFullYear()
      && boxDate.getUTCMonth()    === date.getUTCMonth();
}

export function selectedDate(boxDate, date) {
  let d = new Date(Date.UTC(boxDate.getUTCFullYear(), boxDate.getUTCMonth() + 1, 0));
  let daysInMonth = d.getUTCDate();

  return new Date(Date.UTC(
    boxDate.getUTCFullYear(),
    boxDate.getUTCMonth(),
    Math.min(date.getUTCDate(), daysInMonth),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  ));
}

export function formatBox(boxDate) {
  return boxDate.toLocaleString(undefined, {
    timeZone: 'UTC',
    month: 'short',
  });
}

export const nextBox = date => addUTC(date, { months: 1 });
export const nextRow = date => addUTC(date, { months: 3 });
export const nextPage = date => addUTC(date, { years: 1 });

export const prevBox = date => addUTC(date, { months: -1 });
export const prevRow = date => addUTC(date, { months: -3 });
export const prevPage = date => addUTC(date, { years: -1 });
