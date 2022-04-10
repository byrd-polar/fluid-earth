import svelte from 'rollup-plugin-svelte';
import glslify from 'rollup-plugin-glslify';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import dedent from 'dedent';

const preamble = dedent`
  /**
   * Includes code from some of the following libraries:
   * https://fluid-earth.byrd.osu.edu/legal/THIRD_PARTY
   */
`;

export default {
  input: 'webcomponent/main.js',
  output: {
    format: 'iife',
    name: 'app',
    file: 'dist/webcomponent.js'
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
    terser({
      format: {
        comments: false,
        preamble,
      },
    }),
  ],
  onwarn(warning, warn) {
    // Ignore circular dependency warnings from d3
    // See: https://github.com/d3/d3-selection/issues/168
    if ( warning.code === 'CIRCULAR_DEPENDENCY'
      && warning.importer.includes('d3-')) return;

    warn(warning);
  },
};
