import type { PluginObj } from '@babel/core';
import { generate } from '@babel/generator';
import * as t from '@babel/types';

import {
  CORE_PACKAGE_NAME,
  OTEL_TRACER_DEFAULT_NAME,
  USE_TRACER_HOOK_NAME,
  VANILLA_TRACER_FACTORY_NAME,
} from './constants';
import { uniqueVarName } from './utils';

const LOG_DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true';
const PRINT_GENERATED_CODE =
  process.env.PRINT_GENERATED_CODE === '1' ||
  process.env.PRINT_GENERATED_CODE === 'true';

export default function ottrelitePlugin(): PluginObj {
  return {
    visitor: {
      Program: {
        enter(path) {
          (path as any).__hasUseTraceDirective = false;
        },
        exit(path, state) {
          if ((path as any).__hasUseTraceDirective) {
            const tracerProducerIdentifiers: string[] = [];

            if ((path as any).__hasClassComponent) {
              tracerProducerIdentifiers.push(VANILLA_TRACER_FACTORY_NAME);
            }

            if ((path as any).__hasFunctionComponent) {
              tracerProducerIdentifiers.push(USE_TRACER_HOOK_NAME);
            }

            if (LOG_DEBUG) {
              console.log(
                `[tracePlugin] Program ${state.filename} has use trace directive & requires import of the following tracer producers: ${tracerProducerIdentifiers.join(', ')}.`
              );
            }

            for (const tracerProducerIdentifier of tracerProducerIdentifiers) {
              const alreadyImported = path.node.body.some(
                (node) =>
                  t.isImportDeclaration(node) &&
                  node.source.value === CORE_PACKAGE_NAME &&
                  node.specifiers.some(
                    (spec) =>
                      t.isImportSpecifier(spec) &&
                      ('name' in spec.imported
                        ? spec.imported.name
                        : spec.imported.value) === tracerProducerIdentifier
                  )
              );

              if (!alreadyImported) {
                const importDecl = t.importDeclaration(
                  [
                    t.importSpecifier(
                      t.identifier(tracerProducerIdentifier),
                      t.identifier(tracerProducerIdentifier)
                    ),
                  ],
                  t.stringLiteral(CORE_PACKAGE_NAME)
                );

                path.unshiftContainer('body', importDecl);
              }

              if (LOG_DEBUG) {
                if (alreadyImported) {
                  console.log(
                    `[tracePlugin] ${tracerProducerIdentifier} already imported, skipping import in file ${state.filename}.`
                  );
                } else {
                  console.log(
                    `[tracePlugin] Added import for ${tracerProducerIdentifier} from ${CORE_PACKAGE_NAME} to file ${state.filename}.`
                  );
                }

                if (PRINT_GENERATED_CODE) {
                  console.log(
                    `[tracePlugin] Final program:\n${generate(path.container! as t.Node).code}`
                  );
                }
              }
            }
          }
        },
      },

      Function(path) {
        if (!('directives' in path.node.body)) return;

        const traceDirective = path.node.body.directives.find(({ value }) =>
          value.value.startsWith('use trace')
        );

        if (!traceDirective) return;

        // remove that directive
        path.node.body.directives = path.node.body.directives.filter(
          (d) => d !== traceDirective
        );

        // mark for import
        const program = path.findParent((p) => p.isProgram())!;
        (program as any).__hasUseTraceDirective = true;

        const locationDescription = `'${path.node.loc?.filename ?? program.state?.filename ?? 'unknown'}' at ${path.node.loc?.start.index}:${path.node.loc?.end.index}`;

        // extract the component name from "use trace ..."
        const maybeExplicitNameMatch =
          traceDirective.value.value.match(/use trace\s+(.+)$/);

        let componentName: string | undefined;

        if (maybeExplicitNameMatch) {
          componentName = maybeExplicitNameMatch[1]?.trim();
        }

        let isFunctionComponent = true;

        if ('id' in path.node && path.node.id?.name) {
          // function declaration
          componentName ??= path.node.id.name;
        } else if (
          path.parent.type === 'VariableDeclarator' &&
          path.parent.id.type === 'Identifier'
        ) {
          // variable assignment
          componentName ??= path.parent.id.name;
        } else if (
          path.parent.type === 'ObjectProperty' &&
          path.parent.key.type === 'Identifier'
        ) {
          // object property assignment
          componentName ??= path.parent.key.name;
        } else if (
          path.parent.type === 'ClassMethod' &&
          path.parent.key.type === 'Identifier'
        ) {
          // class method
          isFunctionComponent = false;
          componentName ??= path.parent.key.name;
        } else if (path.parent.type === 'ExportDefaultDeclaration') {
          // anonymous export default
          throw new Error(
            `Identifier ${locationDescription} is an anonymous default export, which is not supported! The tracer must be given a unique name.`
          );
        }

        /**
         * important notice: the above works for ES6, but if the code passed to Babel is already ES5, then it will look like the following:
         *
         * return _createClass(ClassComponentName, [{
         *   key: "render",
         *   value: function render() {
         *     ...
         *   }
         *   },
         *   ...
         * ]);
         *
         * to handle this properly, we need to check if there exists a _createClass parent
         */
        const maybeClassCreationExpression = path.findParent(
          (p) =>
            t.isCallExpression(p.node) &&
            t.isIdentifier(p.node.callee, { name: '_createClass' })
        );
        if (maybeClassCreationExpression) {
          isFunctionComponent = false;
          // so far, the componentName would be 'render'
          try {
            componentName = (
              (maybeClassCreationExpression.node as t.CallExpression)
                .arguments[0] as t.Identifier
            ).name;
          } catch {
            // it's not critical if a more precise name is impossible to extract
          }
        }

        if (LOG_DEBUG) {
          console.log(
            `[tracePlugin] Found directive "${traceDirective.value.value}" in ${locationDescription}, instrumenting component '${componentName}' lifecycle tracing.`
          );
        }

        if (!componentName?.length) {
          console.warn(
            `[tracePlugin] Invalid component name in directive: "${traceDirective.value.value}".`
          );
          return;
        }

        // create variable names
        const tracerId = uniqueVarName('ottreliteTracer');
        const spanId = uniqueVarName('ottreliteComponentSpan');
        const componentResultId = uniqueVarName(
          'ottreliteComponentOriginalResult'
        );

        const tracerProducerIdentifier = isFunctionComponent
          ? USE_TRACER_HOOK_NAME
          : VANILLA_TRACER_FACTORY_NAME;

        // below: important - never unset, a single file could contain both an FC & a CC; instead only set to positive
        if (isFunctionComponent) {
          (program as any).__hasFunctionComponent = true;
        } else {
          (program as any).__hasClassComponent = true;
        }

        // 1. declare tracer variable
        const tracerDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(tracerId),
            t.callExpression(t.identifier(tracerProducerIdentifier), [
              t.stringLiteral(OTEL_TRACER_DEFAULT_NAME),
            ])
          ),
        ]);

        // 2. extract original function body (after directive) and wrap in a function named as the component
        const originalBody = path.node.body.body;
        const originalParams = path.node.params as t.FunctionParameter[];
        const renderFuncOrFCWrappedIdentifier = t.identifier(
          `OttreliteInstrumentationReactWrapped${componentName}`
        );
        const wrappedComponentFunction = t.functionDeclaration(
          renderFuncOrFCWrappedIdentifier,
          originalParams,
          t.blockStatement(originalBody)
        );

        // 3. lambda that invokes the wrapped component function
        const lambdaParam = t.identifier(spanId);
        const originalParamsIdentifiers = originalParams
          .map((param) => {
            if (t.isIdentifier(param)) {
              return t.identifier(param.name);
            } else if (
              t.isAssignmentPattern(param) &&
              t.isIdentifier(param.left)
            ) {
              return t.identifier(param.left.name);
            } else if (
              t.isRestElement(param) &&
              t.isIdentifier(param.argument)
            ) {
              return t.identifier(param.argument.name);
            }

            return undefined;
          })
          .filter((p) => p !== undefined);
        const wrappedCallback = t.arrowFunctionExpression(
          [lambdaParam],
          t.blockStatement([
            // invoke the component function and store result
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier(componentResultId),

                isFunctionComponent
                  ? // FunctionComponent: simply invoke the wrapped function with the span as this
                    t.callExpression(
                      renderFuncOrFCWrappedIdentifier,
                      originalParamsIdentifiers
                    )
                  : // ClassComponent: invoke call( ... ) on the wrapped render function identifier,
                    // NECESSARILY with this bound to the caller's scope (otherwise, e.g. this.props would be broke)
                    t.callExpression(
                      t.memberExpression(
                        renderFuncOrFCWrappedIdentifier,
                        t.identifier('call')
                      ),

                      // this, ...args
                      [t.thisExpression(), ...originalParamsIdentifiers]
                    )
              ),
            ]),
            // call span.end()
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(t.identifier(spanId), t.identifier('end')),
                []
              )
            ),
            // return the temp result
            t.returnStatement(t.identifier(componentResultId)),
          ])
        );

        const tracedComponentBodyWrapper = t.returnStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier(tracerId),
              t.identifier('startActiveSpan')
            ),
            [t.stringLiteral(componentName), wrappedCallback]
          )
        );

        // replace function body: keep only directive + new lines
        (path.node.body as any).body = [
          tracerDeclaration,
          wrappedComponentFunction,
          tracedComponentBodyWrapper,
        ];

        if (LOG_DEBUG && PRINT_GENERATED_CODE) {
          console.log(
            `[tracePlugin] Generated code for component '${componentName}':\n${generate(path.node).code}`
          );
          console.log();
          console.log();
        }
      },
    },
  };
}
