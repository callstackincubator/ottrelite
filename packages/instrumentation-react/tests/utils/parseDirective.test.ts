import * as t from '@babel/types';

import { parseDirective } from '../../src/utils/parseDirective';

describe('parseDirective', () => {
  const makePath = (node: any, parent: any = {}) => ({ node, parent });
  const makeDirective = (value: string) =>
    ({ value: { value } }) as t.Directive;

  it('parses use trace dev', () => {
    const path = makePath({ id: { name: 'MyComponent' } });
    const directive = makeDirective('use trace dev');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result).toEqual({
      componentName: 'MyComponent',
      isFunctionComponent: true,
      apiToUse: 'dev',
    });
  });

  it('parses use trace otel', () => {
    const path = makePath({ id: { name: 'MyComponent' } });
    const directive = makeDirective('use trace otel');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.apiToUse).toBe('otel');
    expect(result.componentName).toBe('MyComponent');
    expect(result.isFunctionComponent).toBe(true);
  });

  it('parses use trace dev MyComponent', () => {
    const path = makePath({ id: { name: 'OtherComponent' } });
    const directive = makeDirective('use trace dev MyComponent');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.apiToUse).toBe('dev');
    expect(result.componentName).toBe('MyComponent');
    expect(result.isFunctionComponent).toBe(true);
  });

  it('parses use trace otel MyComponent', () => {
    const path = makePath({ id: { name: 'OtherComponent' } });
    const directive = makeDirective('use trace otel MyComponent');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.apiToUse).toBe('otel');
    expect(result.componentName).toBe('MyComponent');
    expect(result.isFunctionComponent).toBe(true);
  });

  it('parses use trace MyComponent', () => {
    const path = makePath({ id: { name: 'OtherComponent' } });
    const directive = makeDirective('use trace MyComponent');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.apiToUse).toBe('dev');
    expect(result.componentName).toBe('MyComponent');
    expect(result.isFunctionComponent).toBe(true);
  });

  it('throws on invalid API', () => {
    const path = makePath({ id: { name: 'OtherComponent' } });
    const directive = makeDirective('use trace invalidAPI MyComponent');
    expect(() => parseDirective(path as any, directive, 'loc')).toThrow(
      /Invalid tracing API specified/
    );
  });

  it('throws on anonymous export default', () => {
    const path = makePath({}, { type: 'ExportDefaultDeclaration' });
    const directive = makeDirective('use trace dev');
    expect(() => parseDirective(path as any, directive, 'loc')).toThrow(
      /anonymous default export/
    );
  });

  it('infers name from variable assignment', () => {
    const path = makePath(
      {},
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'VarComponent' },
      }
    );
    const directive = makeDirective('use trace dev');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.componentName).toBe('VarComponent');
  });

  it('infers name from object property', () => {
    const path = makePath(
      {},
      {
        type: 'ObjectProperty',
        key: { type: 'Identifier', name: 'ObjComponent' },
      }
    );
    const directive = makeDirective('use trace dev');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.componentName).toBe('ObjComponent');
  });

  it('infers name from class method and sets isFunctionComponent false', () => {
    const path = makePath(
      {},
      {
        type: 'ClassMethod',
        key: { type: 'Identifier', name: 'MethodComponent' },
      }
    );
    const directive = makeDirective('use trace dev');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.componentName).toBe('MethodComponent');
    expect(result.isFunctionComponent).toBe(false);
  });

  it('returns unknown if no name found', () => {
    const path = makePath({});
    const directive = makeDirective('use trace dev');
    const result = parseDirective(path as any, directive, 'loc');
    expect(result.componentName).toBe('unknown');
  });
});
