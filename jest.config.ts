import type { Config } from 'jest';

const config: Config = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['*/node_modules', '*/lib/'],
};

export default config;
