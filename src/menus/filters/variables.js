const normal = {
  'temperature':
    name => name.startsWith('temperature'),
  'wind':
    name => name.startsWith('wind'),
  'humidity':
    name => name.includes('relative humidity'),
  'precipitation':
    name => name === 'precipitation in previous hour',
  'pressure':
    name => name === 'mean sea level pressure',
  'precipitable water':
    name => name.includes('precipitable water'),
  'cloud water':
    name => name.includes('cloud water'),
  'sunshine':
    name => name === 'sunshine in previous hour',
  'sea temperature':
    name => name === 'sea surface temperature',
  'currents':
    name => name.startsWith('ocean surface currents'),
  'wave height':
    name => name === 'significant wave height',
  'ozone':
    name => name.includes('ozone'),
  'sulfur dioxide':
    name => name.startsWith('sulfur dioxide'),
  'carbon monoxide':
    name => name.startsWith('carbon monoxide'),
  'dust':
    name => name.startsWith('dust'),
  'CAPE':
    name => name.startsWith('convective available potential energy'),
  'geopotential height':
    name => name.startsWith('geopotential height'),
  'wave period':
    name => name === 'primary wave mean period',
  'wave direction':
    name => name === 'primary wave direction (from)',

  undefined: () => false,
};

const simple = {
  'temperature':
    name => name.startsWith('temperature'),
  'wind':
    name => name.startsWith('wind'),
  'humidity':
    name => name.includes('relative humidity'),
  'precipitation':
    name => name === 'precipitation in previous hour',
  'pressure':
    name => name === 'mean sea level pressure',
  'water in atmosphere':
    name => name.includes('precipitable water'),
  'water in clouds':
    name => name.includes('cloud water'),
  'sunshine':
    name => name === 'sunshine in previous hour',
  'sea temperature':
    name => name === 'sea surface temperature',
  'currents':
    name => name.startsWith('ocean surface currents'),
  'wave height':
    name => name === 'significant wave height',
  'ozone':
    name => name.includes('ozone'),
  'sulfur dioxide':
    name => name.startsWith('sulfur dioxide'),
  'carbon monoxide':
    name => name.startsWith('carbon monoxide'),
  'dust':
    name => name.startsWith('dust'),

  undefined: () => false,
};

export default { normal, simple };
