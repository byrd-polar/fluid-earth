import { addUTC, clone } from './utility.js';

export const headerUnit = 'month';

export function headerDate(date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
  ));
}

export function nextHeaderDate(headerDate) {
  return addUTC(headerDate, { months: 1 });
}

export function prevHeaderDate(headerDate) {
  return addUTC(headerDate, { months: -1 });
}

export function formatHeader(headerDate) {
  return headerDate.toLocaleString(undefined, {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  });
}

export const boxUnit = 'day';
export const boxDimensions = [7, 6];

export function boxDates(headerDate) {
  const days = Array.from({ length: 42 }, () => clone(headerDate));
  const offset = -headerDate.getUTCDay() + 1;
  for (let i = 0; i < days.length; i++) days[i].setUTCDate(i + offset);
  return days;
}

export function boxDateEnabled(boxDate, headerDate) {
  return boxDate.getUTCMonth() === headerDate.getUTCMonth();
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getUTCFullYear() === date.getUTCFullYear()
      && boxDate.getUTCMonth()    === date.getUTCMonth()
      && boxDate.getUTCDate()     === date.getUTCDate();
}

export function selectedDate(boxDate, date) {
  return new Date(Date.UTC(
    boxDate.getUTCFullYear(),
    boxDate.getUTCMonth(),
    boxDate.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  ));
}

export function formatBox(boxDate) {
  return boxDate.getUTCDate();
}

export const nextBox = date => addUTC(date, { days: 1 });
export const nextRow = date => addUTC(date, { days: 7 });
export const nextPage = date => addUTC(date, { months: 1 });

export const prevBox = date => addUTC(date, { days: -1 });
export const prevRow = date => addUTC(date, { days: -7 });
export const prevPage = date => addUTC(date, { months: -1 });
