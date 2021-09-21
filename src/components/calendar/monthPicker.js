import { clone } from './utility.js';

export const headerUnit = 'year';

export function headerDate(date) {
  return new Date(
    date.getFullYear(),
    0,
  );
}

export function nextHeaderDate(headerDate) {
  return new Date(
    headerDate.getFullYear() + 1,
    0,
  );
}

export function prevHeaderDate(headerDate) {
  return new Date(
    headerDate.getFullYear() - 1,
    0,
  );
}

export function formatHeader(headerDate) {
  return headerDate.toLocaleString(undefined, {
    year: 'numeric',
  });
}

export const boxUnit = 'month';
export const boxDimensions = [3, 4];

export function boxDates(headerDate) {
  const months = Array.from({ length: 12 }, () => clone(headerDate));
  for (let i = 0; i < months.length; i++) months[i].setMonth(i);
  return months;
}

export function boxDateEnabled(boxDate, headerDate) {
  return true;
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getFullYear() === date.getFullYear() &&
         boxDate.getMonth()    === date.getMonth();
}

export function selectedDate(boxDate, date) {
  return new Date(
    boxDate.getFullYear(),
    boxDate.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

export function formatBox(boxDate) {
  return boxDate.toLocaleString(undefined, {
    month: 'short',
  });
}
