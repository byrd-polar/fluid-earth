import { add, clone } from './utility.js';

export const headerUnit = 'decade';

export function headerDate(date) {
  return new Date(
    Math.floor(date.getFullYear() / 10) * 10,
    0,
  );
}

export function nextHeaderDate(headerDate) {
  return add(headerDate, { years: 10 });
}

export function prevHeaderDate(headerDate) {
  return add(headerDate, { years: -10 });
}

export function formatHeader(headerDate) {
  let end = new Date(headerDate.getFullYear() + 9, 0);
  return [headerDate, end].map(d => d.toLocaleString(undefined, {
    year: 'numeric',
  })).join('-');
}

export const boxUnit = 'year';
export const boxDimensions = [2, 5];

export function boxDates(headerDate) {
  const years = Array.from({ length: 10 }, () => clone(headerDate));
  for (let i = 0; i < years.length; i++) {
    years[i].setFullYear(headerDate.getFullYear() + i);
  }
  return years;
}

export function boxDateEnabled(boxDate, headerDate) {
  return true;
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getFullYear() === date.getFullYear();
}

export function selectedDate(boxDate, date) {
  return new Date(
    boxDate.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

export function formatBox(boxDate) {
  return boxDate.toLocaleString(undefined, {
    year: 'numeric',
  });
}

export const nextBox = date => add(date, { years: 1 });
export const nextRow = date => add(date, { years: 2 });
export const nextPage = date => add(date, { years: 10 });

export const prevBox = date => add(date, { years: -1 });
export const prevRow = date => add(date, { years: -2 });
export const prevPage = date => add(date, { years: -10 });
