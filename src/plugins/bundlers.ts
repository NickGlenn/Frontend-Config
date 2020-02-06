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
  mainFields,
  dedupe,
  preferBuiltins,
  namedExports = {},
  allowAutoConfig,
  packageJson,
  isProduction,
}: CreateRollupConfig) {

  let discoveredExports: TMap<string[]> = {};
  if (allowAutoConfig !== false) {
    for (let packageName of ESM_NOT_SUPPORTED) {
      if (packageJson?.dependencies?.[packageName] || packageJson?.devDependencies?.[packageName]) {
        const path = join(rootDir!, "node_modules", packageName);
        const exported = Object.keys(require(path));
        discoveredExports[packageName] = exported;
      }
    }
  }

  return {
    resolve: (resolve as any)({
      rootDir,
      mainFields,
      dedupe,
      preferBuiltins,
    }),
    commonjs: (commonjs as any)({
      sourceMap: !isProduction,
      namedExports: {
        ...discoveredExports,
        ...namedExports,
      },
    }),
  }
}