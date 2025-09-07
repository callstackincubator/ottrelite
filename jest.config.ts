import path from 'path';
import { type JestConfigWithTsJest, createDefaultPreset } from 'ts-jest';
import { fileURLToPath } from 'url';

const basePreset = createDefaultPreset({
  tsconfig: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    'tsconfig.test.json'
  ),
});

const config: JestConfigWithTsJest = {
  ...basePreset,
};

export default config;
