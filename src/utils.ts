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
 * Picks certain values from an object using an array of keys.
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  let ret: Partial<Pick<T, K>> = {};

  for (let k of keys) {
    ret[k] = obj[k];
  }

  return ret as Pick<T, K>;
}