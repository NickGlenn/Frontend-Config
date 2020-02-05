type FilteredMap<T extends object, K extends string> = { [k in Exclude<keyof T, K>]: T[k] };

/**
 * Filters an object by keys.
 */
export function omit<T extends object, K extends string>(obj: T, keys: K[]): FilteredMap<T, K> {
  let ret: { [key: string]: unknown } = {};

  Object.keys(obj)
    .filter((key: K) => !keys.includes(key))
    .forEach(key => {
      ret[key] = obj[key as keyof T];
    });

  return ret as FilteredMap<T, K>;
}

/**
 * Returns true if the given value is undefined.
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined";
}