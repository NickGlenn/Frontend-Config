type FilteredMap<T extends object, K extends string> = { [k in Exclude<keyof T, K>]: T[k] };

/**
 * Performs a type assertion check to see if the given value is undefined.
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined";
}

/**
 * Performs a type assertion check to see if the given value is an object.
 */
export function isObject(value: unknown): value is object {
  return typeof value === "object";
}

/**
 * Filters an object by keys.
 */
export function omit<T extends object, K extends string>(obj: T, keys: K[]): FilteredMap<T, K> {
  let ret: any = {};

  Object.keys(obj)
    .filter((key: K) => !keys.includes(key))
    .forEach(key => {
      ret[key] = obj[key as keyof T];
    });

  return ret as FilteredMap<T, K>;
}

/**
 * Picks certain values from an object using an array of keys.
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  let ret: Partial<Pick<T, K>> = {};

  for (let k of keys) {
    ret[k] = obj[k];
  }

  return ret as Pick<T, K>;
}