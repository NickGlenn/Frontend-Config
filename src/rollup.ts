import { join } from "path";
import { config } from "dotenv";
import { ExternalOption, OutputOptions, InputOption, InputOptions } from "rollup";
import { RollupReplaceOptions } from "@rollup/plugin-replace";
import { RollupTypescriptOptions } from "@rollup/plugin-typescript";
import { Options as RollupResolveOptions } from "@rollup/plugin-node-resolve";
import { setupPostCSS } from "./plugins/postcss";
import { setupVarInjection } from "./plugins/env";
import { PostCssPluginOptions } from "rollup-plugin-postcss";
import { isUndefined } from "./utils";
import { configureBundlers } from "./plugins/bundlers";
import { DotenvConfigOptions } from "dotenv/types";
import { Options as AutoprefixerOptions } from "autoprefixer";
import { setupStrip } from "./plugins/strip";
import { uglify } from "rollup-plugin-uglify";

const typescript = require("@rollup/plugin-typescript");
const json = require("@rollup/plugin-json");

export type CreateRollupConfig = {
  /** Input options for the build pipeline. */
  input: InputOption;
  /** Output options for the build pipeline. */
  output: OutputOptions;
  /** Determines whether or not this is a production build. */
  isProduction?: boolean | { (): boolean };
  /** When true, your package.json will be inspected and some configurations will be made for you. _Defaults to `true`._ */
  allowAutoConfig?: boolean;
  /** When true, the dotenv will be initialized for the build. */
  dotenv?: boolean | DotenvConfigOptions;
  /** Root directory to resolve from. Used when resolving entrypoint imports, and when resolving deduplicated modules. */
  rootDir?: string;
  /** Manualy provide the contents of package.json */
  packageJson?: PackageJSON;
  /** Alters configuration to better support libraries that can be easily published to NPM or another package registry. */
  isLibrary?: boolean;
  /** Specify external packages that should not be included in this build. */
  external?: ExternalOption;
  /** Inject variables as application "globals" found in the top of your build. */
  inject?: TMap<unknown>;
  /** Specify environment variables that will be injected into your build. */
  exposeEnv?: string[];
  /** Replace string values with JS friendly versions of their values. */
  replaceSafe?: TMap<Primitive | Primitive[]>;
  /** Replace string values with raw values. */
  replaceRaw?: RollupReplaceOptions;
  /** When true, the version in your package.json will be injected as global named `BUILD_VERSION`. */
  injectVersion?: boolean;
  /** Configuration options for Typescript. */
  tsconfig?: Omit<RollupTypescriptOptions, "tsconfig"> & {
    /** Filepath to the tsconfig.json file. */
    jsonPath?: RollupTypescriptOptions["tsconfig"];
  };
  /** Determines whether or not the output bundles should be minified. Defaults to `true` when `NODE_ENV` is set to `production`. */
  minify?: boolean;
  /** Automatically handles namedExports for non-ESM compatible modules. */
  missingExports?: string[];
  /** Manually provide named exports for modules that can't resolve them automatically. */
  namedExports?: TMap<string[]>;
  /** Customize how CSS is compiled for your build pipeline. */
  styles?: boolean | (PostCssPluginOptions & {
    /** Customize how autoprefixing will be handled for your build pipeline. */
    autoprefix?: boolean | AutoprefixerOptions;
  });
  /** Force certain packages to be included in the build (used only when library is set to `true`). */
  forceInclude?: string[];
  /** Configures the Rollup "strip" plugin. _Defaults to stripping debug values when `NODE_ENV` is set to `production`._ */
  strip?: boolean | RollupStripPlugin;
  /** Exposes dangerous configuration settings for Rollup. */
  danger?: Pick<InputOptions, "acorn" | "acornInjectPlugins" | "context" | "moduleContext" | "preserveSymlinks" | "shimMissingExports" | "treeshake">;
  /** Exposes experimental configuration settings for Rollup. */
  experimental?: Pick<InputOptions, "chunkGroupingSize" | "experimentalCacheExpiry" | "experimentalOptimizeChunks" | "perf">;
}
  & Pick<InputOptions, "cache" | "inlineDynamicImports" | "manualChunks" | "onwarn" | "preserveModules" | "strictDeprecations">
  & Pick<RollupResolveOptions, "mainFields" | "dedupe" | "preferBuiltins">;

/**
 * Generates a configuration used by Rollup for compiling and bundling front-end applications.
 */
export function createRollupConfig(options: CreateRollupConfig): object {

  const { danger = {}, experimental = {} } = options;

  // use dotenv file when not explicitly disabled
  if (options.dotenv !== false) {
    config(options.dotenv === true ? undefined : options.dotenv);
  }

  // if rootDir isn't provided, set it manually
  if (isUndefined(options.rootDir)) {
    options.rootDir = process.cwd();
  }

  // if package.json contents weren't explicitly provided, attempt to find them
  var pkg = require(join(options.rootDir, "/package.json"));
  if (!options.packageJson) {
    options.packageJson = pkg;
  } else {
    Object.assign(pkg, options.packageJson);
  }

  // if we're in production, let's try to set some defaults for certain settings
  let isProduction = process.env.NODE_ENV === "production";
  if (typeof options.isProduction === "function") {
    isProduction = options.isProduction();
  }
  else if (typeof options.isProduction === "boolean") {
    isProduction = options.isProduction;
  }
  options.isProduction = isProduction;

  if (isUndefined(options.output.sourcemap)) {
    options.output.sourcemap = !isProduction;
  }

  if (isUndefined(options.minify)) {
    options.minify = isProduction;
  }

  // set up our environment variables, injection values and replacements
  const { inject, replace, external } = setupVarInjection(options);

  // set up the commonjs and node-resolve plugins used for importing modules
  const { commonjs, resolve } = configureBundlers(options);

  // set up styles using the PostCSS plugin
  const styles = setupPostCSS(options);

  // setup default strip values if in production
  const strip = setupStrip(options);

  // get the tsconfig options for this build
  let ts = options.tsconfig || {};
  if (isUndefined(ts?.jsonPath)) {
    ts.jsonPath = join(options.rootDir, "tsconfig.json");
  }

  // rename `file` to tsconfig
  let tsconfig: RollupTypescriptOptions = ts;
  tsconfig.tsconfig = ts.jsonPath;
  delete ts.jsonPath;

  return {
    input: options.input,
    output: options.output,
    external,
    cache: options.cache,
    inlineDynamicImports: options.inlineDynamicImports,
    manualChunks: options.manualChunks,
    onwarn: options.onwarn,
    preserveModules: options.preserveModules,
    strictDeprecations: options.strictDeprecations,
    ...danger,
    ...experimental,
    plugins: [
      styles,
      inject,
      json(),
      typescript(tsconfig),
      replace,
      commonjs,
      resolve,
      strip,
      (options.minify === true ? uglify() : null),
    ],
  };
}