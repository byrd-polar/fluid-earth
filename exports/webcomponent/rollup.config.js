import svelte from 'rollup-plugin-svelte';
import glslify from 'rollup-plugin-glslify';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'exports/webcomponent/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/webcomponent.js'
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
    glslify(),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
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