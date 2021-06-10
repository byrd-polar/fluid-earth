import variableFilters from './variables';

const normal = {
  'weather':
    name => variableFilters.normal['temperature'](name) ||
            variableFilters.normal['humidity'](name) ||
            variableFilters.normal['pressure'](name) ||
            variableFilters.normal['precipitable water'](name) ||
            variableFilters.normal['cloud water'](name) ||
            variableFilters.normal['wind'](name) ||
            variableFilters.normal['precipitation'](name) ||
            variableFilters.normal['CAPE'](name) ||
            variableFilters.normal['geopotential height'](name) ||
            variableFilters.normal['sunshine'](name),
  'gases & aerosols':
    name => variableFilters.normal['ozone'](name) ||
            variableFilters.normal['sulfur dioxide'](name) ||
            variableFilters.normal['carbon monoxide'](name) ||
            variableFilters.normal['dust'](name),
  'ocean':
    name => variableFilters.normal['sea temperature'](name) ||
            variableFilters.normal['currents'](name) ||
            variableFilters.normal['wave height'](name) ||
            variableFilters.normal['wave period'](name) ||
            variableFilters.normal['wave direction'](name),

  undefined: () => false,
};

const simple = normal;

export default { normal, simple };
