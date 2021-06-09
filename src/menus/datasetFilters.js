export const animationFilters = {
  'wind': name => {
    return name.startsWith('wind at');
  },
  'currents': name => {
    return name.includes('currents');
  },
  'none': name => {
    return true;
  },
};

export const basicLevelFilters = {
  'mean sea level': name => {
    return name.includes('mean sea level') ||
           name.includes('wind at 10 m above ground');
  },
  'surface': name => {
    return name.includes('at 2 m above ground') ||
           name.includes('at 10 m above ground') ||
           name.includes('surface') ||
           name.includes('wave') ||
           name.startsWith('precipitation') ||
           name.startsWith('sunshine');
  },
  'cloud': name => {
    return name.includes('at 500 mb');
  },
  'cruise': name => {
    return name.includes('at 200 mb');
  },
  'entire atmosphere': name => {
    return name.startsWith('total') && name !== 'total relative humidity' ||
           name.includes('at 500 mb') && animationFilters['wind'](name);
  },
  // catch-all so that new datasets don't immediately crash application
  undefined: name => false,
};

export const advancedLevelFilters = {
  'mean sea level': name => {
    return name.includes('mean sea level') ||
           name.includes('wind at 10 m above ground');
  },
  'surface': name => {
    return name.includes('at 2 m above ground') ||
           name.includes('at 10 m above ground') ||
           name.includes('surface') ||
           name.includes('wave') ||
           name.startsWith('precipitation') ||
           name.startsWith('sunshine');
  },
  '850 mb': name => {
    return name.includes('at 850 mb');
  },
  '500 mb (cloud)': name => {
    return name.includes('at 500 mb');
  },
  '300 mb': name => {
    return name.includes('at 300 mb');
  },
  '200 mb (cruise)': name => {
    return name.includes('at 200 mb');
  },
  '10 mb (stratosphere)': name => {
    return name.includes('at 10 mb');
  },
  'entire atmosphere': name => {
    return name.startsWith('total') ||
           name.includes('at 500 mb') && animationFilters['wind'](name);
  },
  // catch-all so that new datasets don't immediately crash application
  undefined: name => false,
};

export const basicPropertyFilters = {
  'temperature': name => {
    return name.startsWith('temperature');
  },
  'wind': name => {
    return name.startsWith('wind');
  },
  'humidity': name => {
    return name.includes('relative humidity');
  },
  'precipitation': name => {
    return name === 'precipitation in previous hour';
  },
  'pressure': name => {
    return name === 'mean sea level pressure';
  },
  'precipitable water': name => {
    return name.includes('precipitable water');
  },
  'cloud water': name => {
    return name.includes('cloud water');
  },
  'sunshine': name => {
    return name === 'sunshine in previous hour';
  },
  'currents': name => {
    return name.startsWith('ocean surface currents');
  },
  'sea temperature': name => {
    return name === 'sea surface temperature';
  },
  'wave height': name => {
    return name === 'significant wave height';
  },
  'ozone': name => {
    return name.includes('ozone');
  },
  'sulfur dioxide': name => {
    return name.startsWith('sulfur dioxide');
  },
  'carbon monoxide': name => {
    return name.startsWith('carbon monoxide');
  },
  'dust': name => {
    return name.startsWith('dust');
  },
  // catch-all so that new datasets don't immediately crash application
  undefined: name => false,
};

export const advancedPropertyFilters = {
  ...basicPropertyFilters,
  'CAPE': name => {
    return name.startsWith('convective available potential energy');
  },
  'geopotential height': name => {
    return name.startsWith('geopotential height');
  },
  'wave period': name => {
    return name === 'primary wave mean period';
  },
  'wave direction': name => {
    return name === 'primary wave direction (from)';
  },
};

export const categoryFilters = {
  'weather': name => {
    return advancedPropertyFilters['temperature'](name) ||
           advancedPropertyFilters['humidity'](name) ||
           advancedPropertyFilters['pressure'](name) ||
           advancedPropertyFilters['precipitable water'](name) ||
           advancedPropertyFilters['cloud water'](name) ||
           advancedPropertyFilters['wind'](name) ||
           advancedPropertyFilters['precipitation'](name) ||
           advancedPropertyFilters['CAPE'](name) ||
           advancedPropertyFilters['geopotential height'](name) ||
           advancedPropertyFilters['sunshine'](name);
  },
  'gases & aerosols': name => {
    return advancedPropertyFilters['ozone'](name) ||
           advancedPropertyFilters['sulfur dioxide'](name) ||
           advancedPropertyFilters['carbon monoxide'](name) ||
           advancedPropertyFilters['dust'](name);
  },
  'ocean': name => {
    return advancedPropertyFilters['sea temperature'](name) ||
           advancedPropertyFilters['currents'](name) ||
           advancedPropertyFilters['wave height'](name) ||
           advancedPropertyFilters['wave period'](name) ||
           advancedPropertyFilters['wave direction'](name);
  },
  // catch-all so that new datasets don't immediately crash application
  undefined: name => false,
};
