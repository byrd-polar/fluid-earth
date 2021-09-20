import { clone } from './utility.js';

export const headerUnit = 'month';

export function headerDate(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
  );
}

export function nextHeaderDate(headerDate) {
  return new Date(
    headerDate.getFullYear(),
    headerDate.getMonth() + 1,
  );
}

export function prevHeaderDate(headerDate) {
  return new Date(
    headerDate.getFullYear(),
    headerDate.getMonth() - 1,
  );
}

export function formatHeader(headerDate) {
  return headerDate.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export const boxUnit = 'date';
export const boxDimensions = [7, 6];

export function boxDates(headerDate) {
  const days = Array.from({ length: 42 }, () => clone(headerDate));
  const offset = -headerDate.getDay() + 1;
  for (let i = 0; i < days.length; i++) days[i].setDate(i + offset);
  return days;
}

export function boxDateEnabled(boxDate, headerDate) {
  return boxDate.getMonth() === headerDate.getMonth();
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getFullYear() === date.getFullYear() &&
         boxDate.getMonth()    === date.getMonth()    &&
         boxDate.getDate()     === date.getDate();
}

export function selectedDate(boxDate, date) {
  return new Date(
    boxDate.getFullYear(),
    boxDate.getMonth(),
    boxDate.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

export function formatBox(boxDate) {
  return boxDate.getDate();
}
