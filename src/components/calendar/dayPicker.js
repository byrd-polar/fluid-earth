export const headerUnit = 'month';
export const headerRoundTo = {smallestUnit: 'month', roundingMode: 'trunc'};
export const headerInterval = {months: 1};
export const headerFormat = {month: 'long', year: 'numeric'};

export const boxDimensions = [7, 6];
export const boxOffset = header => { return {days: -(header.dayOfWeek % 7)} };
export const boxInterval = {days: 1};
export const boxEnabled = (box, header) => box.month === header.month;
export const boxSelectedRoundTo = {smallestUnit: 'day', roundingMode: 'trunc'};
export const boxSelect = ['year', 'month', 'day'];
export const boxFormat = {day: 'numeric'};
