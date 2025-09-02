import { transform } from '@babel/core';

import { CORE_PACKAGE_NAME, USE_TRACER_HOOK_NAME } from '../src/constants';
import ottrelitePlugin from '../src/index';

function transformCode(code: string) {
  const result = transform(code, {
    presets: ['module:@react-native/babel-preset'],
    plugins: [ottrelitePlugin],
    filename: 'test.js',
    compact: false,
    retainLines: false,
  });

  return result?.code || '';
}

function normalizeCode(code: string) {
  return (
    code
      // replace UUID-based names with placeholders for consistent snapshots
      .replaceAll(/(\S*)_[a-f0-9]{32}/g, '$1_UUID_PLACEHOLDER')
      // normalize whitespace
      .trim()
  );
}

describe('Ottrelite Babel Plugin', () => {
  describe('Transform tests', () => {
    test('should transform function declaration with implicit tracer name', () => {
      const code = `
        function MyComponent() {
          'use trace';
          const x = 1;
          return <div>{x}</div>;
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform a complex component with implicit tracer name', () => {
      const code = `
        import { useSubheading } from '@hooks/useSubheading';
        import { useEffect, useState } from 'react';
        import { View } from 'react-native';
        import { Text } from 'react-native-paper';

        export type MyComponentProps = {
          heading: string;
        };

        export function MyComponent({ heading }: MyComponentProps) {
          'use trace';

          const [res, setRes] = useState<{ count: number } | null>(null);
          const { subheading } = useSubheading();

          useEffect(() => {
            fetch('http://api.test.com/data')
              .then((response) => response.json())
              .then((data) => setRes(data))
              .catch((error) => console.error(error));
          }, []);

          return (
            <View>
              <Text variant="titleLarge">{heading}</Text>

              <Text variant="titleSmall">{subheading}</Text>

              <Text>{res?.count ?? 'Loading...'}</Text>
            </View>
          );
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform function with explicit tracer name', () => {
      const code = `
        function MyComponent() {
          'use trace CustomName';
          return <div>Hello</div>;
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform arrow function assigned to variable with implicit tracer name', () => {
      const code = `
        const MyComponent = () => {
          'use trace';
          return <div>Hello</div>;
        };
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform function expression assigned to variable with implicit tracer name', () => {
      const code = `
        const MyComponent = function() {
          'use trace';
          return <div>Hello</div>;
        };
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform function in object property with implicit tracer name', () => {
      const code = `
        const obj = {
          MyMethod: function() {
            'use trace';
            return 'result';
          }
        };
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform arrow function in object property with implicit tracer name', () => {
      const code = `
        const obj = {
          MyMethod: () => {
            'use trace';
            return 'result';
          }
        };
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform class methods with implicit tracer name', () => {
      const code = `
        class MyClass {
          myMethod() {
            'use trace';
            return 'result';
          }
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform multiple functions in same file with implicit tracer names', () => {
      const code = `
        function ComponentA() {
          'use trace';
          return <div>A</div>;
        }
        
        function ComponentB() {
          'use trace';
          return <div>B</div>;
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should handle function with complex body with implicit tracer name', () => {
      const code = `
        function MyComponent(props) {
          'use trace';
          const x = 1;
          const y = 2;
          console.log(x + y);
          if (props.show) {
            return <div>{x + y}</div>;
          }
          return null;
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should handle function with complex body and destructured props with implicit tracer name', () => {
      const code = `
        function MyComponent({ show }) {
          'use trace';
          const x = 1;
          const y = 2;
          console.log(x + y);
          if (show) {
            return <div>{x + y}</div>;
          }
          return null;
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should not transform function without use trace directive', () => {
      const code = `
        function MyComponent() {
          'use strict';
          return <div>Hello</div>;
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should not transform when no directive is present', () => {
      const code = `
        function MyComponent() {
          const x = 1;
          return <div>{x}</div>;
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    describe('Error handling', () => {
      test('should throw error for anonymous default export', () => {
        const code = `
        export default function() {
          'use trace';
          return <div>Hello</div>;
        }
      `;

        expect(() => transformCode(code)).toThrow(
          /is an anonymous default export, which is not supported/
        );
      });

      test('should handle invalid component name gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const code = `
        const obj = {};
        obj['dynamic'] = function() {
          'use trace';
          return 'result';
        };
      `;

        const result = transformCode(code);

        // Should not transform the function
        expect(result).not.toContain('startActiveSpan');
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid component name in directive')
        );

        consoleSpy.mockRestore();
      });
    });

    describe('Import behavior', () => {
      test(`should add ${USE_TRACER_HOOK_NAME} import when use trace directive is found`, () => {
        const code = `
        function MyComponent() {
          'use trace';
          return <div>Hello</div>;
        }
      `;

        const result = transformCode(code);
        expect(result).toContain(CORE_PACKAGE_NAME);
        expect(result).toContain(USE_TRACER_HOOK_NAME);
      });

      test(`should not add duplicate import if ${USE_TRACER_HOOK_NAME} is already imported`, () => {
        const code = `
        import { ${USE_TRACER_HOOK_NAME} } from '${CORE_PACKAGE_NAME}';
        
        function MyComponent() {
          'use trace';
          return <div>Hello</div>;
        }
      `;

        const result = transformCode(code);
        const importMatches = result.match(/@ottrelite\/core/g);
        expect(importMatches).toHaveLength(1);
      });

      test('should not add import when no use trace directive is found', () => {
        const code = `
        function MyComponent() {
          return <div>Hello</div>;
        }
      `;

        const result = transformCode(code);
        expect(result).not.toContain(CORE_PACKAGE_NAME);
      });
    });
  });
});
