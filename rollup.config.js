import svelte from 'rollup-plugin-svelte';
import glslify from 'rollup-plugin-glslify';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import { platform } from 'os';

const production = !process.env.ROLLUP_WATCH;
const windows = (platform() === 'win32');

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),

    // For GLSL .vert and .frag files
    glslify({
      compress: production,
    }),

    // For in-lining topojson (for web component)
    json(),

    postcss({
      extract: true,
      minimize: production,
      sourceMap: true,
    }),

    replace({
      // For tippy.js, do find/replace for a reference to Node environment in code
      // with actual value (since it will be running in the browser, not Node?).
      // See: https://atomiks.github.io/tippyjs/v6/faq/#rollup
      'process.env.NODE_ENV': JSON.stringify(
        production ? 'production' : 'development'
      ),
      __windows__: JSON.stringify(windows),
      __webcomponent__: JSON.stringify(false),
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  },
  onwarn(warning, warn) {
    // Ignore circular dependency warnings from d3
    // See: https://github.com/d3/d3-selection/issues/168
    if (warning.code === 'CIRCULAR_DEPENDENCY' &&
        warning.importer.includes('d3-')) {
      return;
    }

    // Ignore custom element warning (we use a differnt rollup config for that)
    if (warning.pluginCode === 'missing-custom-element-compile-options' &&
        warning.filename.includes('Map.svelte')) {
      return;
    }

    warn(warning);
  },
};

function serve() {
  let server;

  function toExit() {
    if (server) server.kill();
  }

  return {
    writeBundle() {
      if (server) return;

      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}
