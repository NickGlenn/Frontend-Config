import { CreateRollupConfig } from "../rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export const ESM_NOT_SUPPORTED = ["react", "react-dom"];

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
}: CreateRollupConfig) {

  let discoveredExports: TMap<string[]> = {};
  if (allowAutoConfig) {
    for (let packageName of ESM_NOT_SUPPORTED) {
      if (packageJson?.dependencies?.[packageName] || packageJson?.devDependencies?.[packageName]) {
        const pkg = require(packageName);
        discoveredExports[packageName] = Object.keys(pkg);
      }
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
      namedExports: {
        ...discoveredExports,
        ...namedExports,
      },
    }),
  }
}