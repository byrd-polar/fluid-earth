import replace from '@rollup/plugin-replace';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import glslify from 'rollup-plugin-glslify';
import license from 'rollup-plugin-license';

import { platform, hostname } from 'os';
import { execSync } from 'child_process';
import dedent from 'dedent';

const windows = (platform() === 'win32');
const commit = execSync('git rev-parse --short HEAD').toString().trim();
const htmlComment = dedent`
  <!--
    Fluid Earth (fev2r)
    =====================================================================
    Commit:                                  ${commit}
    Generated:                               ${(new Date).toISOString()}
    License:                                 /legal/LICENSE
    Licenses of third-party libraries:       /legal/THIRD_PARTY
    Modifications to third-party libraries:  /legal/MODIFICATIONS
  -->
`;

// https://vitejs.dev/config/
export default ({ _, mode }) => {
  const production = mode === 'production';
  const plugins = [
    replace({
      // Set date to closest time in production
      __production__: JSON.stringify(production),
      // Fix local file paths for dev environments on Windows
      __windows__: JSON.stringify(windows),
      // Allow environments (e.g. Cloudflare Pages) to specify a custom prefix
      // for fetcher.js requests
      __fev2r_api__: JSON.stringify(process.env.FEV2R_API ?? ''),
      // Whether to look for '.fp16.br' or '.fp16.gz' (default) compressed files
      __use_brotli__: JSON.stringify(
        process.env.FEV2R_USE_BROTLI === 'true' ||
        hostname() === 'fever.byrd.osu.edu'
      ),
      // Plugin option to avoid assignment errors
      preventAssignment: true,
    }),
    // For .svelte files
    svelte(),
    // For GLSL .vert and .frag files
    glslify({
      compress: production,
    }),
    // Add build and license info to index.html
    commentHtml(),

  ];

  const productionOnlyPlugins = [
    license({
      thirdParty: {
        output: {
          file: 'dist/legal/THIRD_PARTY'
        },
      },
    }),
    copyLicenseAndPatches(),
  ];

  return {
    build: {
      rollupOptions: {
        plugins: productionOnlyPlugins,
      },
      terserOptions: {
        format: { comments: false },
      },
      chunkSizeWarningLimit: 600,
      sourcemap: true,
    },
    plugins,
  };
}

function commentHtml() {
  return {
    transformIndexHtml(html) {
      return html
        .replace('<!-- insert build and license info -->', htmlComment)
        // fix built-in transform spacing
        .replace('  \n  <script', '  <script')
        .replace(/    <link/g, '  <link')
        .replace('  </head>', '</head>');
    }
  };
}

import {
  appendFile, copyFile, readdir, readFile, writeFile
} from 'fs/promises';

function copyLicenseAndPatches() {
  return {
    async generateBundle() {
      await copyFile('LICENSE', 'dist/legal/LICENSE');

      const party = 'dist/legal/THIRD_PARTY';
      await appendFile(party, '\n\n\n---\n\n');
      await appendFile(party, await readFile('src/map/colormaps/VENDORED'));

      let patchDir = 'patches/';
      let modFile = 'dist/legal/MODIFICATIONS';

      let patches = await readdir(patchDir);

      if (patches.length === 0) {
        await writeFile(modFile, 'none');
      } else {
        await writeFile(modFile, '');
        for (const patch of patches) {
          await appendFile(modFile, await readFile(patchDir + patch));
        }
      }
    }
  };
}
