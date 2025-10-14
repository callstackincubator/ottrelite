import { NodePath, PluginPass } from '@babel/core';
import * as t from '@babel/types';

export function getLocationDescription(
  path: NodePath<t.Function> | t.ClassMethod | t.ClassPrivateMethod,
  pluginPass: PluginPass
) {
  let loc: t.SourceLocation | undefined | null;
  if ('node' in path) {
    loc = path.node.loc;
  } else {
    loc = path.loc;
  }

  return `${pluginPass.filename}:${loc?.start.line}:${loc?.start.column} through ${loc?.end.line}:${loc?.end.column}`;
}
