export const headerUnit = 'day';
export const headerRoundTo = {smallestUnit: 'day', roundingMode: 'trunc'};
export const headerInterval = {days: 1};
export const headerFormat = {month: 'long', year: 'numeric', day: 'numeric'};

export const boxDimensions = [4, 6];
export const boxOffset = false;
export const boxInterval = {hours: 1};
export const boxEnabled = () => true;
export const boxSelectedRoundTo = {smallestUnit: 'hour', roundingMode: 'trunc'};
export const boxSelect = ['year', 'month', 'day', 'hour'];
export const boxFormat = (box, utc) => box.date.toLocaleString([], {
  timeZone: utc ? 'UTC' : undefined,
  hour12: !utc,
  hour: 'numeric',
  minute: '2-digit',
});
