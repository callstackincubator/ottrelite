import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { generate } from '@babel/generator';
import * as t from '@babel/types';
import type { TracingAPI } from '@ottrelite/core';

import {
  CORE_PACKAGE_NAME,
  TRACE_COMPONENT_LIFECYCLE_HOC_NAME,
  TRACE_COMPONENT_LIFECYCLE_HOOK_NAME,
  UNKNOWN_COMPONENT_NAME_PLACEHOLDER,
} from './constants';
import { isEnvBoolVarTrue, uniqueVarName } from './utils';

const LOG_DEBUG = isEnvBoolVarTrue('DEBUG');
const PRINT_GENERATED_CODE = isEnvBoolVarTrue('PRINT_GENERATED_CODE');

type AugmentedProgramNode = NodePath<t.Program> & {
  __hasUseTraceDirective: boolean;
  __hasClassComponent: boolean;
  __hasFunctionComponent: boolean;
};

function parseDirective(
  path: NodePath<t.Function | t.Class>,
  traceDirective: t.Directive,
  locationDescription: string
) {
  // extract the component name from "use trace ..."
  const maybeMatches = traceDirective.value.value
    .match(/use trace\s+(\S+)(?:\s+(\S+))?$/)
    ?.filter((x) => x !== undefined);

  let componentName: string | undefined;
  let apiToUse: TracingAPI = 'dev';

  if (maybeMatches) {
    // case 1: 'use trace <api/name>'; give priority to api (if valid) over name
    if (maybeMatches.length === 2) {
      const apiName = maybeMatches[1]?.trim();

      if (apiName === 'dev' || apiName === 'otel') {
        apiToUse = apiName;
      } else {
        componentName = apiName;
      }
    }

    // case 2: 'use trace <api> <name>'
    if (maybeMatches.length === 3) {
      const apiName = maybeMatches[1]?.trim();
      componentName = maybeMatches[2]?.trim();

      if (apiName === 'dev' || apiName === 'otel') {
        apiToUse = apiName;
      } else {
        throw new Error(
          `[Ottrelite] Invalid tracing API specified: "${apiName}". Supported APIs are "dev" and "otel". Localization: ${locationDescription}.`
        );
      }
    }
  }

  let isFunctionComponent = true;

  if ('id' in path.node && path.node.id?.name) {
    // function or class declaration
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
      `[Ottrelite] Identifier is an anonymous default export, which is not supported! The tracer must be given a unique name. Localization: ${locationDescription}.`
    );
  }

  // /**
  //  * important notice: the above works for ES6, but if the code passed to Babel is already ES5, then it will look like the following:
  //  *
  //  * return _createClass(ClassComponentName, [{
  //  *   key: "render",
  //  *   value: function render() {
  //  *     ...
  //  *   },
  //  *   ...
  //  * ]);
  //  *
  //  * to handle this properly, we need to check if there exists a _createClass parent
  //  */
  // const maybeClassCreationExpression = path.findParent(
  //   (p) =>
  //     t.isCallExpression(p.node) &&
  //     t.isIdentifier(p.node.callee, { name: '_createClass' })
  // );
  // if (maybeClassCreationExpression) {
  //   isFunctionComponent = false;
  //   // so far, the componentName would be 'render'
  //   try {
  //     componentName = (
  //       (maybeClassCreationExpression.node as t.CallExpression)
  //         .arguments[0] as t.Identifier
  //     ).name;
  //   } catch {
  //     // it's not critical if a more precise name is impossible to extract
  //   }
  // }

  return {
    componentName: componentName ?? UNKNOWN_COMPONENT_NAME_PLACEHOLDER,
    isFunctionComponent,
    apiToUse,
  };
}

function getLocationDescription(
  path: NodePath | t.ClassMethod,
  pluginPass: PluginPass
) {
  const loc =
    path.type === 'ClassMethod' ? (path as t.ClassMethod).loc : path.node.loc;
  return `${pluginPass.filename}:${loc?.start.line}:${loc?.start.column} through ${loc?.end.line}:${loc?.end.column}`;
}

export default function ottrelitePlugin(): PluginObj {
  return {
    visitor: {
      Program: {
        // @ts-ignore-next-line - purposeful type override
        enter(path: AugmentedProgramNode) {
          path.__hasUseTraceDirective = false;
        },
        // @ts-ignore-next-line - purposeful type override
        exit(path: AugmentedProgramNode, state) {
          if (path.__hasUseTraceDirective) {
            const tracerProducerIdentifiers: string[] = [];

            if (path.__hasClassComponent) {
              tracerProducerIdentifiers.push(
                TRACE_COMPONENT_LIFECYCLE_HOC_NAME
              );
            }

            if (path.__hasFunctionComponent) {
              tracerProducerIdentifiers.push(
                TRACE_COMPONENT_LIFECYCLE_HOOK_NAME
              );
            }

            if (LOG_DEBUG) {
              console.log(
                `[tracePlugin] Program ${state.filename} has 'use trace' directive & requires import of the following tracer producers: ${tracerProducerIdentifiers.join(', ')}.`
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

      Function(path, pluginPass) {
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
        (program as AugmentedProgramNode).__hasUseTraceDirective = true;

        const locationDescription = getLocationDescription(path, pluginPass);

        const { apiToUse, componentName, isFunctionComponent } = parseDirective(
          path,
          traceDirective,
          locationDescription
        );

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

        if (isFunctionComponent) {
          (program as AugmentedProgramNode).__hasFunctionComponent = true;

          // 1. declare useComponentRenderTracing() result storage identifier
          const useComponentRenderTracingResultIdentifier = t.identifier(
            uniqueVarName('__ottreliteUseComponentRenderTracingResult')
          );
          const useComponentRenderTracingResDeclaration = t.variableDeclaration(
            'const',
            [
              t.variableDeclarator(
                useComponentRenderTracingResultIdentifier,
                t.callExpression(
                  t.identifier(TRACE_COMPONENT_LIFECYCLE_HOOK_NAME),
                  [
                    t.stringLiteral(componentName), // eventName
                    t.identifier('undefined'), // additionalEventArgs
                    t.stringLiteral(apiToUse), // api
                  ]
                )
              ),
            ]
          );

          // 2. extract original function body (after directive) and wrap in a function named as the component
          const originalBody = path.node.body.body;
          const originalParams = path.node.params as t.FunctionParameter[];
          const wrappedFCIdentifier = t.identifier(
            `OttreliteWrapped${componentName}`
          );
          const wrappedComponentFunction = t.functionDeclaration(
            wrappedFCIdentifier,
            originalParams,
            t.blockStatement(originalBody)
          );

          // 3. lambda that invokes the wrapped component function
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

          const componentResultId = uniqueVarName('__ottreliteCompOrigResult');

          // 3. replace function body: keep only directive + new lines
          (path.node.body as any).body = [
            // I. invoke the hook and store the result
            useComponentRenderTracingResDeclaration,
            // II. declare the original function as a wrapped function inside the new component body's scope
            wrappedComponentFunction,
            // III. invoke the original component function and store result
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier(componentResultId),

                t.callExpression(wrappedFCIdentifier, originalParamsIdentifiers)
              ),
            ]),
            // IV. call useComponentRenderTracingResultIdentifier.markJSRenderEnd() to finalize the trace
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  useComponentRenderTracingResultIdentifier,
                  t.identifier('markJSRenderEnd')
                ),
                []
              )
            ),
            // V. return the temp result (of the original component)
            t.returnStatement(t.identifier(componentResultId)),
          ];
        }

        if (LOG_DEBUG && PRINT_GENERATED_CODE) {
          console.log(
            `[tracePlugin] Generated code for component '${componentName}':\n${generate(path.node).code}`
          );
          console.log();
          console.log();
        }
      },

      Class(classPath, pluginPass) {
        for (const path of classPath.node.body.body) {
          if (!t.isClassMethod(path)) {
            return;
          }

          const traceDirective = path.body.directives.find(({ value }) =>
            value.value.startsWith('use trace')
          );

          if (!traceDirective) return;

          // remove that directive
          path.body.directives = path.body.directives.filter(
            (d) => d !== traceDirective
          );

          // mark for import
          const program = classPath.findParent((p) => p.isProgram())!;
          (program as AugmentedProgramNode).__hasUseTraceDirective = true;

          const locationDescription = getLocationDescription(path, pluginPass);

          const { apiToUse, componentName } = parseDirective(
            classPath,
            traceDirective,
            locationDescription
          );

          (program as AugmentedProgramNode).__hasClassComponent = true;

          // wrap the class component inside the HOC
          if (classPath.isClassDeclaration()) {
            const classNode = classPath.node;

            // turn class declaration into a class expression
            const classExpr = t.classExpression(
              classNode.id, // may be null if anonymous
              classNode.superClass,
              classNode.body,
              classNode.decorators || []
            );

            // wrap the class expression in your HOC
            const hocCall = t.callExpression(
              t.identifier(TRACE_COMPONENT_LIFECYCLE_HOC_NAME),
              [
                t.stringLiteral(componentName),
                t.stringLiteral(apiToUse),
                classExpr,
              ]
            );

            // if the class was declared like `class CC {}`,
            // replace it with: `const CC = hoc("CC", class CC {});`
            const declarationReplacement = t.variableDeclaration('const', [
              t.variableDeclarator(classNode.id!, hocCall),
            ]);

            classPath.replaceWith(declarationReplacement);
          } else if (classPath.isClassExpression()) {
            const hocCall = t.callExpression(
              t.identifier(TRACE_COMPONENT_LIFECYCLE_HOC_NAME),
              [
                t.stringLiteral(componentName),
                t.stringLiteral(apiToUse),
                classPath.node,
              ]
            );
            classPath.replaceWith(hocCall);
          } else {
            throw new Error(
              `[Ottrelite] Unhandled class variant found in processed code. This is a missing feature in Ottrelite. Localization: ${locationDescription}.`
            );
          }

          if (LOG_DEBUG && PRINT_GENERATED_CODE) {
            console.log(
              `[tracePlugin] Generated code for component '${componentName}':\n${generate(classPath.node).code}`
            );
            console.log();
            console.log();
          }
        }
      },
    },
  };
}
