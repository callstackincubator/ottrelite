import * as path from 'node:path';
import url from 'node:url';

import { withCallstackPreset } from '@callstack/rspress-preset';
import { defineConfig } from '@rspress/core';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default withCallstackPreset(
  {
    context: __dirname,
    docs: {
      title: 'React Native Ottrelite',
      description: 'React Native Ottrelite Documentation',
      icon: '/img/favicon.svg',
      logoDark: '/img/logo-dark.png',
      logoLight: '/img/logo-light.png',
      socials: {
        github: 'https://github.com/callstackincubator/ottrelite',
      },
      editUrl:
        'https://github.com/callstackincubator/ottrelite/edit/main/website',
      rootUrl: 'https://oss.callstack.com/ottrelite/',
      rootDir: 'src',
    },
  },
  defineConfig({
    base: '/ottrelite/',
    outDir: 'build',
    plugins: [
      // @ts-ignore-next-line -- typedoc plugin has invalid typings
      pluginTypeDoc({
        entryPoints: [
          path.join(__dirname, '..', 'packages', 'core', 'src', 'index.ts'),
          path.join(
            __dirname,
            '..',
            'packages',
            'backend-wrapper-tracy',
            'src',
            'index.ts'
          ),
          path.join(
            __dirname,
            '..',
            'packages',
            'backend-platform',
            'src',
            'index.ts'
          ),
          path.join(
            __dirname,
            '..',
            'packages',
            'interop-otel',
            'src',
            'index.ts'
          ),
        ],
        outDir: 'api',
      }),
    ],
  })
);
