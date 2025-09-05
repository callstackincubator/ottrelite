import { getLocationDescription } from '../../src/utils/getLocationDescription';

describe('getLocationDescription', () => {
  it('returns correct location for NodePath with loc', () => {
    const path = {
      node: {
        loc: {
          start: { line: 1, column: 2 },
          end: { line: 3, column: 4 },
        },
      },
      type: 'NodePath',
    } as any;
    const pluginPass = { filename: 'file.ts' } as any;
    expect(getLocationDescription(path, pluginPass)).toBe(
      'file.ts:1:2 through 3:4'
    );
  });

  it('returns correct location for ClassMethod', () => {
    const classMethod = {
      type: 'ClassMethod',
      loc: {
        start: { line: 10, column: 20 },
        end: { line: 30, column: 40 },
      },
    } as any;
    const pluginPass = { filename: 'class.ts' } as any;
    expect(getLocationDescription(classMethod, pluginPass)).toBe(
      'class.ts:10:20 through 30:40'
    );
  });

  it('handles missing loc gracefully', () => {
    const path = {
      node: {},
      type: 'NodePath',
    } as any;
    const pluginPass = { filename: 'nofile.ts' } as any;
    expect(getLocationDescription(path, pluginPass)).toBe(
      'nofile.ts:undefined:undefined through undefined:undefined'
    );
  });
});
