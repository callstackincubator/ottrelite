const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { execSync } = require('child_process');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);

const packagesInfo = JSON.parse(
  execSync('pnpm -r list --depth -1 --json', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .join('')
);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = mergeConfig(defaultConfig, {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    unstable_enableSymlinks: true,
  },
  watchFolders: packagesInfo.map((packageInfo) => packageInfo.path),
});
