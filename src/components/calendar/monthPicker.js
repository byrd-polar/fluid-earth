import { add, clone } from './utility.js';

export const headerUnit = 'year';

export function headerDate(date) {
  return new Date(
    date.getFullYear(),
    0,
  );
}

export function nextHeaderDate(headerDate) {
  return add(headerDate, { years: 1 });
}

export function prevHeaderDate(headerDate) {
  return add(headerDate, { years: -1 });
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
  return boxDate.getFullYear() === date.getFullYear()
      && boxDate.getMonth()    === date.getMonth();
}

export function selectedDate(boxDate, date) {
  let d = new Date(boxDate.getFullYear(), boxDate.getMonth() + 1, 0);
  let daysInMonth = d.getDate();

  return new Date(
    boxDate.getFullYear(),
    boxDate.getMonth(),
    Math.min(date.getDate(), daysInMonth),
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

export const nextBox = date => add(date, { months: 1 });
export const nextRow = date => add(date, { months: 3 });
export const nextPage = date => add(date, { years: 1 });

export const prevBox = date => add(date, { months: -1 });
export const prevRow = date => add(date, { months: -3 });
export const prevPage = date => add(date, { years: -1 });
