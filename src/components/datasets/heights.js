const normal = {
  'mean sea level':
    name => name.includes('mean sea level')
         || name.includes('wind at 10 m above ground'),
  'surface':
    name => name.includes('at 2 m above ground')
         || name.includes('at 10 m above ground')
         || name.includes('surface')
         || name.includes('wave')
         || name.startsWith('precipitation')
         || name.startsWith('average precipitation')
         || name.startsWith('sunshine')
         || name.startsWith('permafrost'),
  '850 mb':
    name => name.includes('at 850 mb'),
  '500 mb':
    name => name.includes('at 500 mb'),
  '300 mb':
    name => name.includes('at 300 mb'),
  '200 mb':
    name => name.includes('at 200 mb'),
  '10 mb (stratosphere)':
    name => name.includes('at 10 mb'),
  'entire atmosphere':
    name => name.startsWith('total')
         || name.includes('at 500 mb') && name.startsWith('wind at'),

  undefined: () => false,
};

const simple = {
  'mean sea level':
    name => name.includes('mean sea level')
         || name.includes('wind at 10 m above ground'),
  'surface':
    name => name.includes('at 2 m above ground')
         || name.includes('at 10 m above ground')
         || name.includes('surface')
         || name.includes('wave')
         || name.startsWith('precipitation')
         || name.startsWith('average precipitation')
         || name.startsWith('sunshine')
         || name.startsWith('permafrost'),
  'cloud':
    name => name.includes('at 500 mb'),
  'cruise':
    name => name.includes('at 200 mb'),
  'entire atmosphere':
    name => name.startsWith('total') && name !== 'total relative humidity'
         || name.includes('at 500 mb') && name.startsWith('wind at'),

  undefined: () => false,
};

export default { normal, simple };
