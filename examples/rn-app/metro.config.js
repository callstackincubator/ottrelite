const { getDefaultConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { execSync } = require('child_process');

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
module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    unstable_enableSymlinks: true,
  },
  watchFolders: packagesInfo.map((packageInfo) => packageInfo.path),
};
