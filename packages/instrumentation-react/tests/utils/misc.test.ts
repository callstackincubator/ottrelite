import { uniqueVarName } from '../../src/utils/misc';

describe('Utils', () => {
  describe('uniqueVarName', () => {
    test('should generate unique variable names with base prefix', () => {
      const name1 = uniqueVarName('test');
      const name2 = uniqueVarName('test');

      expect(name1).toMatch(/^test_[a-f0-9]{32}$/);
      expect(name2).toMatch(/^test_[a-f0-9]{32}$/);
      expect(name1).not.toBe(name2);
    });

    test('should handle different base names', () => {
      const tracerName = uniqueVarName('tracer');
      const spanName = uniqueVarName('span');

      expect(tracerName).toMatch(/^tracer_[a-f0-9]{32}$/);
      expect(spanName).toMatch(/^span_[a-f0-9]{32}$/);
      expect(tracerName).not.toBe(spanName);
    });

    test('should handle empty base name', () => {
      const name = uniqueVarName('');
      expect(name).toMatch(/^_[a-f0-9]{32}$/);
    });

    test('should handle special characters in base name', () => {
      const name = uniqueVarName('my-component');
      expect(name).toMatch(/^my-component_[a-f0-9]{32}$/);
    });

    test('should generate 100 unique variable names with no duplicates', () => {
      const generatedNames = new Set<string>();
      const baseName = 'test';

      for (let i = 0; i < 100; i++) {
        const name = uniqueVarName(baseName);
        generatedNames.add(name);
      }

      // All 100 names should be unique
      expect(generatedNames.size).toBe(100);
    });
  });
});
