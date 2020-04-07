import { join } from "path";
import * as deepmerge from "deepmerge";
import { config } from "dotenv";
import { ExternalOption, Plugin, RollupOptions } from "rollup";
import { RollupJsonOptions } from "@rollup/plugin-json";
import { RollupReplaceOptions } from "@rollup/plugin-replace";
import { RollupTypescriptOptions } from "@rollup/plugin-typescript";
import { RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import { RollupAliasOptions } from "@rollup/plugin-alias";
import { Options as RollupResolveOptions } from "@rollup/plugin-node-resolve";
import { PostCssPluginOptions } from "rollup-plugin-postcss";
import { isUndefined } from "./utils";
import { DotenvConfigOptions } from "dotenv/types";
import { Options as AutoprefixerOptions } from "autoprefixer";
import * as autoprefixer from "autoprefixer";
import { RollupStripPlugin } from "@rollup/plugin-strip";
import { PackageJSON } from "./package-json";
import { NullableMap, Primitive, PrimitiveMap, StringMap, TMap } from "./generics";

const postcss = require("rollup-plugin-postcss");
const json = require("@rollup/plugin-json");
const typescript = require("@rollup/plugin-typescript");
const replace = require("@rollup/plugin-replace");
const commonjs = require("@rollup/plugin-commonjs");
const alias = require("@rollup/plugin-alias");
const resolve = require("@rollup/plugin-node-resolve");
const strip = require("@rollup/plugin-strip");
const { uglify } = require("rollup-plugin-uglify");

export const ESM_NOT_SUPPORTED = [
  "react-dom",
  "react-is",
  "react",
  "prop-types",
];

export type CreateRollupConfig =
  & Partial<PresetOptions>
  & Omit<RollupOptions, "plugins">;

// export type CreateRollupConfig = {
//   /** Input options for the build pipeline. */
//   input: InputOption;
//   /** Output options for the build pipeline. */
//   output: OutputOptions;
//   /** Configuration options for Typescript. */
//   tsconfig?: Omit<RollupTypescriptOptions, "tsconfig"> & {
//     /** Filepath to the tsconfig.json file. */
//     jsonPath?: RollupTypescriptOptions["tsconfig"];
//   };

//   /** Manually provide named exports for modules that can't resolve them automatically. */
//   namedExports?: TMap<string[]>;
//   /** Customize how CSS is compiled for your build pipeline. */
//   styles?: boolean | (PostCssPluginOptions & {

//   });

//   /** Configures the Rollup "strip" plugin. _Defaults to stripping debug values when `NODE_ENV` is set to `production`._ */
//   strip?: boolean | RollupStripPlugin;
//   /** Exposes dangerous configuration settings for Rollup. */
//   danger?: Pick<InputOptions, "acorn" | "acornInjectPlugins" | "context" | "moduleContext" | "preserveSymlinks" | "shimMissingExports" | "treeshake">;
//   /** Exposes experimental configuration settings for Rollup. */
//   experimental?: Pick<InputOptions, "chunkGroupingSize" | "experimentalCacheExpiry" | "experimentalOptimizeChunks" | "perf">;
// }
//   & Pick<InputOptions, "cache" | "inlineDynamicImports" | "manualChunks" | "onwarn" | "preserveModules" | "strictDeprecations">
//   & Pick<RollupResolveOptions, "mainFields" | "dedupe" | "preferBuiltins">;

export type PresetOptions = {
  /** Determines whether or not this is a production build. */
  isProduction: boolean | { (): boolean };
  /** When true, your package.json will be inspected and some configurations will be made for you. _Defaults to `true`._ */
  allowAutoConfig: boolean;
  /** Unless `null`, the dotenv will be initialized for the build. */
  dotenv: null | DotenvConfigOptions;
  /** Root directory to resolve from. Used when resolving entrypoint imports, and when resolving deduplicated modules. */
  rootDir: string;
  /** Manualy provide the contents of package.json */
  packageJson: PackageJSON;
  /** Alters configuration to better support libraries that can be easily published to NPM or another package registry. */
  isLibrary: boolean;
  /** Specify external packages that should not be included in this build. */
  external: ExternalOption;
  /** Inject variables as application "globals" found in the top of your build. */
  inject: TMap<unknown>;
  /** Specify environment variables that will be injected into your build. */
  exposeEnv: string[];
  /** Replace string values with JS friendly versions of their values. */
  replace: TMap<Primitive | Primitive[]>;
  /** Shorthand for configuring module alias entries using the alias plugin. */
  alias: RollupAliasOptions["entries"];
  /** Unless `null`, the version in your package.json will be injected as global with the given name. _Defaults to `BUILD_VERSION`._ */
  injectVersion: string;
  /** Determines whether or not the output bundles should be minified. Defaults to `true` when `NODE_ENV` is set to `production`. */
  minify: boolean;
  /** Determines whether or not source maps should be generated for any generated bundles. _Defaults to `true` unless `isProduction` is `true`._ */
  sourcemaps: boolean;
  /** Automatically handles namedExports for non-ESM compatible modules. */
  missingExports: string[];
  /** Customize how CSS autoprefixing will be handled for your build pipeline. */
  autoprefixCSS: null | AutoprefixerOptions;
  /** Force certain packages to be included in the build (used only when library is set to `true`). */
  forceInclude: string[];
  /** Configure plugins using a map or function. */
  plugins: Partial<NullableMap<PluginConfigMap>> | PluginConfigFunction;
};

export type PluginConfigMap = {
  /** PostCSS plugin for compiling CSS, SCSS, PostCSS in your build. */
  styles: PostCssPluginOptions;
  /** Configuration options for the JSON importer plugin. */
  json: Partial<RollupJsonOptions>;
  /** Configuration options for the Typescript plugin. */
  typescript: RollupTypescriptOptions;
  /** Configuration options for the replace plugin. */
  replace: RollupReplaceOptions;
  /** Configuration options for the CommonJS plugin. */
  commonjs: RollupCommonJSOptions;
  /** Configuration options for the alias plugin. */
  alias: Partial<RollupAliasOptions>;
  /** Configuration options for the node-resolve plugin. */
  resolve: RollupResolveOptions;
  /** Configuration options for the strip plugin. */
  strip: RollupStripPlugin;
  /** Configuration options for the uglify plugin. */
  uglify: {};
};

export type PluginFunctionMap = {
  [key in keyof PluginConfigMap]: (options?: PluginConfigMap[key]) => null | Plugin;
} & {
  /** Runs the inject plugin generated by this preset. */
  inject(): Plugin;
};

export type PluginConfigFunction = (plugins: PluginFunctionMap) => (null | Plugin)[];
/**
 * Generates a configuration used by Rollup for compiling and bundling front-end applications.
 */
export function createRollupConfig(options: CreateRollupConfig): object {

  // use dotenv file when not explicitly disabled
  if (options.dotenv !== null) {
    config(options.dotenv);
  }

  // the NODE_ENV to use for the plugin
  if (isUndefined(process.env.NODE_ENV)) {
    process.env.NODE_ENV = "development";
  }

  // split out the config options specific for this preset from the ones that rollup
  let {
    isProduction = (process.env.NODE_ENV === "production"),
    allowAutoConfig = true,
    dotenv,
    rootDir = process.cwd(),
    packageJson = {},
    isLibrary = false,
    inject = {},
    injectVersion = "BUILD_VERSION",
    exposeEnv = ["NODE_ENV"],
    replace: replaceSafe = {},
    alias: aliasEntries = {},
    minify,
    sourcemaps,
    missingExports = [],
    autoprefixCSS,
    forceInclude = [],
    plugins,
    ...rollupConfig } = options;

  // create the function for building the plugins
  const _buildPlugins = (typeof plugins === "function" ? plugins : buildPluginsDefault);
  const _plugins = (plugins !== null && typeof plugins === "object" ? plugins : {});

  // determine if this is a production build or not
  isProduction = (typeof isProduction === "function" ? isProduction() : isProduction);

  // load up package.json and apply overrides on top
  const packageJsonPath = join(rootDir, "/package.json");
  packageJson = deepmerge<PackageJSON>(require(packageJsonPath), packageJson);

  // when `isLibrary` is set to `true`, automatically fill in the `external` option
  if (isLibrary === true && isUndefined(options.external)) {
    options.external = Object.keys(packageJson.dependencies || {});
  }

  // if minify isn't explicitly set, set it to `true` based on `isProduction`
  if (isUndefined(minify)) { minify = isProduction; }

  // if sourcemaps isn't explicitly set, set it based on `isProduction`.
  if (isUndefined(sourcemaps)) { sourcemaps = !isProduction; }

  // disable uglify and strip if they don't have an explicit configuration and minify is false
  if (isUndefined(_plugins.uglify) && !minify) { _plugins.uglify = null; }
  if (isUndefined(_plugins.strip) && !minify) { _plugins.strip = null; }

  // configure sourcemaps for the build depending on whether the user has explicitly set them
  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map(output => {
      if (isUndefined(output.sourcemap)) { output.sourcemap = sourcemaps; }
      return output;
    });
  }
  else if (isUndefined(rollupConfig.output?.sourcemap)) {
    rollupConfig.output!.sourcemap = sourcemaps;
  }

  // "inject" the package.json version when enabled
  if (typeof injectVersion === "string") {
    inject[injectVersion] = packageJson.version;
  }

  // if we're using auto config and preact is found, we need to add aliasing for preact/compat
  if (allowAutoConfig && hasPackage(packageJson, "preact")) {
    if (Array.isArray(aliasEntries)) {
      aliasEntries.push({
        find: "react",
        replacement: "preact/compat",
      }, {
        find: "react-dom",
        replacement: "preact/compat",
      });
    } else {
      aliasEntries = {
        "react": "preact/compat",
        "react-dom": "preact/compat",
        ...aliasEntries,
      };
    }
  }

  // creates factory functions for each plugin that use our defaults instead of the plugin's
  const bindPlugin = <K extends keyof PluginConfigMap, T extends PluginConfigMap[K]>(key: K, fn: (args: unknown) => Plugin, defaults: PluginConfigMap[K] = {}) => {
    if (_plugins[key] === null) { return () => null; }
    if (_plugins[key]) { defaults = deepmerge<PluginConfigMap[K]>(defaults, _plugins[key] as PluginConfigMap[K]); }
    return (opts: PluginConfigMap[K] = {}) => {
      return fn(deepmerge<PluginConfigMap[K]>(defaults, opts));
    };
  };

  // construct the plugin map that will be given to the plugin configuration function
  const pluginFunctions: PluginFunctionMap = {
    styles: bindPlugin("styles", postcss, {
      extract: true,
      minimize: minify,
      sourceMap: sourcemaps,
      plugins: [
        (autoprefixCSS !== null ? autoprefixer(autoprefixCSS) : null),
      ],
    }),
    json: bindPlugin("json", json),
    typescript: bindPlugin("typescript", typescript, {
      declaration: isLibrary,
    }),
    replace: bindPlugin("replace", replace, getReplaceConfig(exposeEnv, replaceSafe)),
    commonjs: bindPlugin("commonjs", commonjs, getCommonJsConfig({
      sourcemaps,
      allowAutoConfig,
      missingExports,
      packageJson,
      rootDir,
    })),
    alias: bindPlugin("alias", alias, { entries: aliasEntries }),
    resolve: bindPlugin("resolve", resolve),
    strip: bindPlugin("strip", strip, {
      debugger: true,
      functions: ["console.*", "assert.*"],
      sourceMap: sourcemaps,
    }),
    uglify: bindPlugin("uglify", uglify),
    inject: buildInject(inject),
  };

  // all done!
  return {
    ...rollupConfig,
    plugins: _buildPlugins(pluginFunctions),
  };
}

/**
 * Default function for building plugins.
 */
function buildPluginsDefault({
  styles,
  inject,
  json,
  typescript,
  replace,
  commonjs,
  alias,
  resolve,
  strip,
  uglify,
}: PluginFunctionMap): (null | Plugin)[] {
  return [
    styles(),
    inject(),
    json(),
    typescript(),
    replace(),
    commonjs(),
    alias(),
    resolve(),
    strip(),
    uglify(),
  ];
}

/**
 * Builds up the values map for the replace plugin.
 */
function getReplaceConfig(exposeEnv: string[], replaceSafe: PrimitiveMap) {
  let output: StringMap = {};

  for (let env of exposeEnv) {
    output[`process.env.${env}`] = JSON.stringify(process.env[env]);
  }

  for (let key in replaceSafe) {
    output[key] = JSON.stringify(replaceSafe[key]);
  }

  return { values: output };
}

/**
 * Constructs the inject plugin.
 */
function buildInject(injectMap: TMap<unknown> = {}) {
  return function inject() {
    let inject: Plugin = { name: "injectVars", intro: "" };

    for (let k in injectMap) {
      if (/^[a-zA-Z\$\_][\w\$\_]+$/.test(k)) {
        inject.intro += `var ${k} = ${JSON.stringify(injectMap[k])};\n`;
      } else {
        throw new Error(`Unable to inject value "${k}" as it's an invalid JS variable name.`);
      }
    }

    return inject;
  };
}

/**
 * Loads missing exports and builds out the named exports map automagically.
 */
function getCommonJsConfig({
  missingExports,
  rootDir,
  allowAutoConfig,
  packageJson,
  sourcemaps,
}: Pick<PresetOptions, "missingExports" | "rootDir" | "allowAutoConfig" | "packageJson" | "sourcemaps">): RollupCommonJSOptions {

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
      if (hasPackage(packageJson, packageName)) {
        console.warn(`Failed to find package "${packageName}" to load missing exports. Make sure this module is installed.`);
      }
    }
  }

  return {
    sourceMap: sourcemaps,
    namedExports: discoveredExports,
  };
}

/**
 * Returns true if the given package json file has the specified package in either dependencies
 * or it's devDependencies.
 */
function hasPackage(pkg: PackageJSON, name: string): boolean {
  return !!(pkg.dependencies?.[name] || pkg.devDependencies?.[name]);
}