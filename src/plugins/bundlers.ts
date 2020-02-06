import { CreateRollupConfig } from "../rollup";
import { join } from "path";

const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");

export const ESM_NOT_SUPPORTED = [
  "react-dom",
  "react-is",
  "react",
  "prop-types",
];

/**
 * Configures the commonjs and node-resolve plugins for Rollup.
 */
export function configureBundlers({
  rootDir,
  mainFields = ["browser", "jsnext", "module", "main"],
  dedupe = [],
  preferBuiltins = true,
  namedExports = {},
  allowAutoConfig,
  packageJson,
  isProduction,
  missingExports = [],
}: CreateRollupConfig) {

  if (allowAutoConfig !== false) {
    missingExports = ESM_NOT_SUPPORTED.concat(missingExports);
  }

  let discoveredExports: TMap<string[]> = {};
  for (let packageName of missingExports) {
    try {
      const path = join(rootDir!, "node_modules", packageName);
      const exported = Object.keys(require(path));
      discoveredExports[packageName] = exported;
    } catch (err) {
      console.warn(`Failed to find package "${packageName}" to load missing exports. Make sure this module is installed.`);
    }
  }

  return {
    resolve: resolve({
      rootDir,
      mainFields,
      dedupe,
      preferBuiltins,
    }),
    commonjs: commonjs({
      sourceMap: !isProduction,
      namedExports: {
        ...discoveredExports,
        ...namedExports,
      },
    }),
  };
}