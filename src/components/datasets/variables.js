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
  'geopotential height':
    name => name.startsWith('geopotential height'),
  'wave period':
    name => name === 'primary wave mean period',
  'avg. temperature':
    name => name === 'average temperature at 2 m above ground',
  'avg. temperature anomaly':
    name => name === 'average temperature at 2 m above ground anomaly',
  'avg. precipitation':
    name => name === 'average precipitation per day',
  'avg. precipitation anomaly':
    name => name === 'average precipitation per day anomaly',
  'permafrost probability':
    name => name === 'permafrost probability',
  'permafrost (low res.)':
    name => name === 'permafrost probability [low resolution]',

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
  'avg. temperature':
    name => name === 'average temperature at 2 m above ground',
  'avg. temperature anomaly':
    name => name === 'average temperature at 2 m above ground anomaly',
  'avg. precipitation':
    name => name === 'average precipitation per day',
  'avg. precipitation anomaly':
    name => name === 'average precipitation per day anomaly',
  'permafrost probability':
    name => name === 'permafrost probability',
  'permafrost (low res.)':
    name => name === 'permafrost probability [low resolution]',

  undefined: () => false,
};

export default { normal, simple };
