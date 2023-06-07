const normal = {
  'wind':
    name => name.startsWith('wind at'),
  'currents':
    name => name === 'ocean surface currents',
  'none':
    name => name === 'none',

  undefined: () => false,
};

const simple = normal;

export default { normal, simple };
