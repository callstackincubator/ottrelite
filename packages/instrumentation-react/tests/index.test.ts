import { transform } from '@babel/core';

import {
  CORE_PACKAGE_NAME,
  TRACE_COMPONENT_LIFECYCLE_HOC_NAME,
  TRACE_COMPONENT_LIFECYCLE_HOOK_NAME,
} from '../src/constants';
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

    test('should transform class methods with implicit tracer name', () => {
      const code = `
        class MyClass {
          render() {
            'use trace';
            return 'result';
          }
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform class component with unary explicit dev API', () => {
      const code = `
        class MyClass {
          render() {
            'use trace dev';
            return 'result';
          }
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform class component with unary explicit otel API', () => {
      const code = `
        class MyClass {
          render() {
            'use trace otel';
            return 'result';
          }
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform class component with unary custom component name', () => {
      const code = `
        class MyClass {
          render() {
            'use trace CustomTestName';
            return 'result';
          }
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform class components with two parameters: API and component name, for both APIs specified', () => {
      const code = `
        class MyClass {
          render() {
            'use trace dev CustomTestName1';
            return 'result';
          }
        }
        class MyClass2 {
          render() {
            'use trace otel CustomTestName2';
            return 'result';
          }
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform function component with unary explicit dev API', () => {
      const code = `
        function MyComponent() {
          'use trace dev';
          return 'result';
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform function component with unary explicit otel API', () => {
      const code = `
        function MyComponent() {
          'use trace otel';
          return 'result';
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform function component with unary custom component name', () => {
      const code = `
        function MyComponent() {
          'use trace CustomTestName';
          return 'result';
        }
      `;

      const result = transformCode(code);
      expect(normalizeCode(result)).toMatchSnapshot();
    });

    test('should transform function components with two parameters: API and component name', () => {
      const code = `
        function MyComponent() {
          'use trace dev CustomTestName';
          return 'result';
        }
        function MyComponent2() {
          'use trace otel CustomTestName';
          return 'result';
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
    });

    describe('Import behavior', () => {
      test(`should add ${TRACE_COMPONENT_LIFECYCLE_HOOK_NAME} import when use trace directive is found in an FC`, () => {
        const code = `
          function MyComponent() {
            'use trace';
            return <div>Hello</div>;
          }
        `;

        const result = transformCode(code);
        expect(result).toContain(CORE_PACKAGE_NAME);
        expect(result).toContain(TRACE_COMPONENT_LIFECYCLE_HOOK_NAME);
      });

      test(`should not add duplicate import if ${TRACE_COMPONENT_LIFECYCLE_HOOK_NAME} is already imported an FC`, () => {
        const code = `
          import { ${TRACE_COMPONENT_LIFECYCLE_HOOK_NAME} } from '${CORE_PACKAGE_NAME}';
          
          function MyComponent() {
            'use trace';
            return <div>Hello</div>;
          }
        `;

        const result = transformCode(code);
        const importMatches = result.match(/@ottrelite\/core/g);
        expect(importMatches).toHaveLength(1);
      });

      test('should not add import when no use trace directive is found an FC', () => {
        const code = `
          function MyComponent() {
            return <div>Hello</div>;
          }
        `;

        const result = transformCode(code);
        expect(result).not.toContain(CORE_PACKAGE_NAME);
      });

      test(`should add ${TRACE_COMPONENT_LIFECYCLE_HOOK_NAME} import when use trace directive is found in a class component`, () => {
        const code = `
          class MyComponent {
            render() {
              'use trace';
              return <div>Hello</div>;
            }
          }
        `;

        const result = transformCode(code);
        expect(result).toContain(CORE_PACKAGE_NAME);
        expect(result).toContain(TRACE_COMPONENT_LIFECYCLE_HOC_NAME);
      });

      test(`should not add duplicate import if ${TRACE_COMPONENT_LIFECYCLE_HOOK_NAME} is already imported in a class component`, () => {
        const code = `
          import { ${TRACE_COMPONENT_LIFECYCLE_HOOK_NAME} } from '${CORE_PACKAGE_NAME}';
          
          class MyComponent {
            render() {
              'use trace';
              return <div>Hello</div>;
            }
          }
        `;

        const result = transformCode(code);
        const importMatches = result.match(/@ottrelite\/core/g);
        expect(importMatches).toHaveLength(1);
      });

      test('should not add import when no use trace directive is found in a class component', () => {
        const code = `
          class MyComponent {
            render() {
              return <div>Hello</div>;
            }
          }
        `;

        const result = transformCode(code);
        expect(result).not.toContain(CORE_PACKAGE_NAME);
      });
    });
  });
});
