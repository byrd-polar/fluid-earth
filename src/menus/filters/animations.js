const normal = {
  'wind':
    name => name.startsWith('wind at'),
  'currents':
    name => name.includes('currents'),
  'none':
    name => true,

  undefined: () => false,
};

const simple = normal;

export default { normal, simple };
