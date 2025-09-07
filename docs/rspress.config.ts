import * as path from 'node:path';

import { pluginCallstackTheme } from '@callstack/rspress-theme/plugin';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';
import katex from 'rspress-plugin-katex';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'React Native Ottrelite',
  description: 'React Native Ottrelite Documentation',
  logoText: 'React Native Ottrelite',
  icon: '/img/logo.png',
  logo: '/img/logo.png',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/callstackincubator/ottrelite',
      },
    ],
    footer: {
      message: `Copyright © ${new Date().getFullYear()} Callstack Open Source`,
    },
  },
  markdown: {
    checkDeadLinks: true,
  },
  base: '/ottrelite/',
  plugins: [
    pluginCallstackTheme(),
    pluginTypeDoc({
      entryPoints: [
        path.join(__dirname, '..', 'packages', 'core', 'src', 'index.ts'),
        path.join(
          __dirname,
          '..',
          'packages',
          'backend-wrapper-tracy',
          'src',
          'index.ts',
        ),
        path.join(
          __dirname,
          '..',
          'packages',
          'backend-platform',
          'src',
          'index.ts',
        ),
        path.join(
          __dirname,
          '..',
          'packages',
          'interop-otel',
          'src',
          'index.ts',
        ),
      ],
      outDir: 'api',
    }),
    // @ts-ignore-next-line -- katex has invalid typings
    katex(),
  ],
});
