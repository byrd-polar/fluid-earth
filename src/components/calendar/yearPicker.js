export const headerUnit = 'decade';
export const headerRoundTo = {smallestUnit: 'year', roundingIncrement: 10, roundingMode: 'trunc'};
export const headerInterval = {years: 10};
export const headerFormat = (header, utc) => {
  let end = header.add({years: 9});
  let options = {year: 'numeric', timeZone: utc ? 'UTC' : undefined};
  return [header, end].map(dt => dt.date.toLocaleString([], options)).join('-');
}

export const boxDimensions = [2, 5];
export const boxOffset = false;
export const boxInterval = {years: 1};
export const boxEnabled = () => true;
export const boxSelectedRoundTo = {smallestUnit: 'year', roundingMode: 'trunc'};
export const boxSelect = ['year'];
export const boxFormat = {year: 'numeric'};
