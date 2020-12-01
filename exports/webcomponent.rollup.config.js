import svelte from 'rollup-plugin-svelte';
import glslify from 'rollup-plugin-glslify';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'exports/webcomponent.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/webcomponent.js'
  },
  plugins: [
    svelte({
      customElement: true
    }),
    glslify(),
    json(),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    // in-line topology as part of bundle
    replace({ __webcomponent__: JSON.stringify(true) }),
  ],
  onwarn(warning, warn) {
    // Ignore circular dependency warnings from d3
    // See: https://github.com/d3/d3-selection/issues/168
    if (warning.code === 'CIRCULAR_DEPENDENCY' &&
        warning.importer.includes('d3-')) {
      return;
    }

    warn(warning);
  },
};
