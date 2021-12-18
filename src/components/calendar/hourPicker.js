import { clone } from './utility.js';

export const headerUnit = 'day';

export function headerDate(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

export function nextHeaderDate(headerDate) {
  return new Date(
    headerDate.getFullYear(),
    headerDate.getMonth(),
    headerDate.getDate() + 1,
  );
}

export function prevHeaderDate(headerDate) {
  return new Date(
    headerDate.getFullYear(),
    headerDate.getMonth(),
    headerDate.getDate() - 1,
  );
}

export function formatHeader(headerDate) {
  return headerDate.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
  });
}

export const boxUnit = 'hour';
export const boxDimensions = [4, 6];

export function boxDates(headerDate) {
  const hours = Array.from({ length: 24 }, () => clone(headerDate));
  for (let i = 0; i < hours.length; i++) hours[i].setHours(i);
  return hours;
}

export function boxDateEnabled(boxDate, headerDate) {
  return true;
}

export function boxDateSelected(boxDate, date) {
  return boxDate.getFullYear() === date.getFullYear()
      && boxDate.getMonth()    === date.getMonth()
      && boxDate.getDate()     === date.getDate()
      && boxDate.getHours()    === date.getHours();
}

export function selectedDate(boxDate, date) {
  return new Date(
    boxDate.getFullYear(),
    boxDate.getMonth(),
    boxDate.getDate(),
    boxDate.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

export function formatBox(boxDate) {
  return boxDate.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
