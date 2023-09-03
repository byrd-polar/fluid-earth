import replace from '@rollup/plugin-replace';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import glslify from 'rollup-plugin-glslify';
import license from 'rollup-plugin-license';

import { promisify } from 'util';
import { exec as _exec } from 'child_process';
const exec = promisify(_exec);
import {
  access,
  appendFile,
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  symlink,
  writeFile,
} from 'fs/promises';
import { platform } from 'os';
import { resolve } from 'path';
import dedent from 'dedent';

// print dev server address as `localhost` for Node.js versions < 17
import dns from 'dns'
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default async ({ mode }) => {
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
    svelte({
      preprocess: [customEmToPx()],
    }),
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
    // symlink public/tera instead of copying it
    customCopyPublicDir(),
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
      copyPublicDir: false,
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

function customCopyPublicDir() {
  return {
    async generateBundle() {
      await copyDir('public', 'dist', true);
    }
  }
}

async function copyDir(srcDir, destDir, symlinkTera=false) {
  await mkdir(destDir, { recursive: true });

  for (let path of await readdir(srcDir)) {
    let src = resolve(srcDir, path);
    let dest = resolve(destDir, path);

    if (symlinkTera && path === 'tera') {
      await symlink(src, dest);

    } else if ((await stat(src)).isDirectory()) {
      await copyDir(src, dest);

    } else {
      await copyFile(src, dest);
    }
  }
}

function customEmToPx() {
  const files = [
    'svelte-toggle/src/Toggle.svelte',
    'svelte-range-slider-pips/src/RangeSlider.svelte',
  ];
  return {
    name: 'convert em/rem units of third-party components to px',
    style: ({ content, filename }) => {
      if (files.find(file => filename.endsWith(file))) {
        const code = content.replaceAll(
          /([0-9.]+)r?em/g,
          (_, value) => `${parseFloat(value) * 16}px`,
        );
        return { code };
      }
    },
  }
}
