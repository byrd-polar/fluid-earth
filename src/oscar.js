// This function is in its own separate file to simplify the import tree. See
// the corresponding commit (find via git blame) for details.

// Given a year, return the Dates that correspond to the OSCAR data that
// will be available that year (72 Dates with 5 or 6 day gaps) in order from
// earliest to latest
export function validOscarDates(year) {
  let leapYear = ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);

  return Array.from({length: 72}, (_, i) => {
    let day = Math.floor((leapYear ? 366 : 365) * i / 72);
    return new Date(Date.UTC(year, 0, 1 + day));
  });
}
