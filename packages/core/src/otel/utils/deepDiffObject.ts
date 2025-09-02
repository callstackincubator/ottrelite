export type Difference = {
  reason: string;
  key?: string;
  oldValue: any;
  newValue: any;
};

export function deepDiffObject<T>(oldProps: T, newProps: T): Difference[] {
  const diffs: Difference[] = [];

  if (typeof oldProps !== typeof newProps) {
    return [
      {
        reason: 'types differ',
        oldValue: oldProps,
        newValue: newProps,
      },
    ];
  }

  if (typeof oldProps === 'object') {
    const isArray = Array.isArray(oldProps);

    for (const key in oldProps) {
      const difference = deepDiffObject(oldProps[key], newProps![key]);
      if (difference.length > 0) {
        diffs.push(
          ...difference.map((diff) => ({
            ...diff,
            key: isArray ? `${key}[${diff.key}]` : `${key}.${diff.key}`,
          }))
        );
      }
    }
  } else if (oldProps !== newProps) {
    diffs.push({
      reason: 'values differ',
      oldValue: oldProps,
      newValue: newProps,
    });
  }

  return diffs;
}
