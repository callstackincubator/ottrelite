import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import type { TracingAPI } from '@ottrelite/core';

export function parseDirective(
  path: NodePath<t.Function | t.Class>,
  traceDirective: t.Directive,
  locationDescription: string
) {
  // I. Extract the component name from "use trace ..."
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

  // II. Attempt to read displayName or name, if componentName is still undefined
  if (!componentName && t.isFunction(path.node)) {
    // look for .displayName or .name assignments in parent scope
    const parent = path.findParent(
      (p) => p.isProgram() || p.isBlockStatement()
    );
    if (parent) {
      parent.traverse({
        AssignmentExpression(assignPath) {
          if (
            assignPath.node.left.type === 'MemberExpression' &&
            assignPath.node.left.property.type === 'Identifier' &&
            (assignPath.node.left.property.name === 'displayName' ||
              assignPath.node.left.property.name === 'name') &&
            assignPath.node.right.type === 'StringLiteral'
          ) {
            componentName = assignPath.node.right.value;
          }
        },
      });
    }
  }

  const isClassMember =
    (path.parent.type === 'ClassMethod' &&
      path.parent.key.type === 'Identifier') ||
    (path.parent.type === 'ObjectProperty' && t.isFunction(path.node));
  if (isClassMember) {
    isFunctionComponent = false;
  }

  // III. Infer the name from context, if componentName is still undefined
  if (!componentName) {
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
    } else if (isClassMember) {
      // class method
      componentName ??= ((path.parent as t.ClassMethod).key as t.Identifier)
        .name;
    } else if (path.parent.type === 'ExportDefaultDeclaration') {
      // anonymous export default
      throw new Error(
        `[Ottrelite] Identifier is an anonymous default export, which is not supported! The tracer must be given a unique name. Localization: ${locationDescription}.`
      );
    }
  }

  return {
    componentName: componentName ?? 'unknown',
    isFunctionComponent,
    apiToUse,
  };
}
