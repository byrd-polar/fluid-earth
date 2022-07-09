import replace from '@rollup/plugin-replace';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import glslify from 'rollup-plugin-glslify';
import license from 'rollup-plugin-license';

import { promisify } from 'util';
import { exec as _exec } from 'child_process';
const exec = promisify(_exec);
import {
  access, appendFile, copyFile, readdir, readFile, writeFile
} from 'fs/promises';
import { platform } from 'os';
import dedent from 'dedent';


// https://vitejs.dev/config/
export default async ({ _, mode }) => {
  const production = mode === 'production';

  const commit = await (async () => {
    try {
      return (await exec('git rev-parse --short HEAD')).stdout.trim();
    } catch {
      return '???????';
    }
  })();

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

  // If local data files don't exist, use the remote ones
  const dataProxy = await (async () => {
    try {
      await access('./public/tera');
      return false;
    } catch {
      return { '/tera': 'https://fluid-earth.byrd.osu.edu' };
    }
  })();

  const plugins = [
    replace({
      // Hide developer-only tools in production
      __production__: JSON.stringify(production),
      // Set initial date based on forecast instead of current time
      __using_local_data_files__: JSON.stringify(!dataProxy),
      // Fix local file paths for dev environments on Windows
      __windows__: JSON.stringify(platform() === 'win32'),
      // Allow environments (e.g. Cloudflare Pages) to specify a custom prefix
      // for fetcher.js requests
      __fev2r_api__: JSON.stringify(process.env.FEV2R_API ?? ''),
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
    commentHtml(htmlComment),
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

  // Optionally enable https for local dev, install
  // https://github.com/FiloSottile/mkcert and run
  //
  //  mkcert -install; mkcert localhost
  //
  // in the same directory as this config to generate the certificates below
  const https = await (async () => {
    try {
      return {
        key: await readFile('./localhost-key.pem'),
        cert: await readFile('./localhost.pem'),
      };
    } catch {
      return false;
    }
  })();

  return {
    css: {
      devSourcemap: true,
    },
    build: {
      rollupOptions: {
        plugins: productionOnlyPlugins,
      },
      minify: 'terser',
      terserOptions: {
        format: { comments: false },
      },
      chunkSizeWarningLimit: 900,
      sourcemap: true,
    },
    plugins,
    server: {
      // some files only exist in prod build; proxy them as not to break links
      proxy: {
        '/legal': 'https://fluid-earth.byrd.osu.edu',
        ...dataProxy,
      },
      https,
    },
  };
}

function commentHtml(text) {
  return {
    transformIndexHtml(html) {
      return html
        .replace('<!-- insert build and license info -->', text)
        // fix built-in transform spacing
        .replace('  \n  <script', '  <script')
        .replace(/    <link/g, '  <link')
        .replace('  </head>', '</head>');
    }
  };
}

function copyLicenseAndPatches() {
  return {
    async generateBundle() {
      await copyFile('LICENSE', 'dist/legal/LICENSE');

      const party = 'dist/legal/THIRD_PARTY';
      await appendFile(party, '\n\n\n---\n\n');
      await appendFile(party, await readFile('./VENDORED'));

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
