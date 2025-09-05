import { v4 as uuidv4 } from 'uuid';

export function uniqueVarName(base: string) {
  return `${base}_${uuidv4().replace(/-/g, '')}`;
}

export function isEnvBoolVarTrue(variable: string): boolean {
  const value = process.env[variable];
  return value === '1' || value === 'true';
}
