import { NodePath, PluginPass } from '@babel/core';
import * as t from '@babel/types';

export function getLocationDescription(
  path: NodePath | t.ClassMethod,
  pluginPass: PluginPass
) {
  const loc =
    path.type === 'ClassMethod' ? (path as t.ClassMethod).loc : path.node.loc;
  return `${pluginPass.filename}:${loc?.start.line}:${loc?.start.column} through ${loc?.end.line}:${loc?.end.column}`;
}
