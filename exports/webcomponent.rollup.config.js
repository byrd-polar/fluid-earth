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
    replace({ '_FEV2R_WC = false': '_FEV2R_WC = true'}),
  ],
};
