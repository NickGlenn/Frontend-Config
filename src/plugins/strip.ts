import { CreateRollupConfig } from "../rollup";
import { Plugin } from "rollup";
import { isObject, isUndefined } from "../utils";
const _strip = require("@rollup/plugin-strip");

/**
 * Configures the strip plugin.
 */
export function setupStrip({ strip, isProduction }: CreateRollupConfig): null | Plugin {
  if (strip === false || (isUndefined(strip) && !isProduction)) {
    return null;
  }

  let config: RollupStripPlugin = {};

  if (isObject(strip)) {
    Object.assign(config, strip);
  }

  return _strip(config);
}