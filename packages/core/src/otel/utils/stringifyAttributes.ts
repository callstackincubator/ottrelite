/**
 * Stringifies any attributes object by converting its values to strings.
 * @param attributes - The attributes to stringify.
 * @returns A new object with stringified values.
 */
export function stringifyAttributes(
  attributes?: Record<string, unknown> | null
): Record<string, string> {
  if (!attributes) return {};

  const record: Record<string, string> = {};

  Object.entries(attributes).forEach(([key, value]) => {
    try {
      record[key] = JSON.stringify(value);
    } catch {
      record[key] = '<serialization error>';
    }
  });

  return record;
}
