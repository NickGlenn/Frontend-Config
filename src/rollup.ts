import * as path from "path";
import { JsxEmit } from "typescript";
import { ExternalOption, OutputOptions, InputOptions } from "rollup";
import { namedExports } from "./named-exports";
import * as dotenv from "dotenv";
import { omit } from "./utils";

// load the rollup plugins that are provided by this config lib
import replace, { RollupReplaceOptions } from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import typescript, { RollupTypescriptOptions } from "@rollup/plugin-typescript";
import resolve, { Options as RollupResolveOptions } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import postcss, { PostCssPluginOptions } from "rollup-plugin-postcss";
import { isUndefined } from "util";
import * as autoprefixer from "autoprefixer";

export type CreateRollupConfig = {
  /** Input options for the build pipeline. */
  input: InputOptions;
  /** Output options for the build pipeline. */
  output: OutputOptions;
  /** When true, the dotenv will be initialized for the build. */
  dotenv?: boolean | dotenv.DotenvConfigOptions;
  /** Root directory to resolve from. Used when resolving entrypoint imports, and when resolving deduplicated modules. */
  rootDir?: string;
  /** Manualy provide the contents of package.json */
  packageJson?: PackageJSON;
  /** Alters configuration to better support libraries that can be easily published to NPM or another package registry. */
  library?: boolean;
  /** Specify a preset configuration to use based on framework. */
  framework?: "react" | "preact";
  /** Specify external packages that should not be included in this build. */
  external?: ExternalOption;
  /** Force certain packages to be included in the build (used only when library is set to `true`). */
  forceInclude?: string[];
  /** Specify environment variables that will be injected into your build. */
  injectEnv?: string[];
  /** Replace string values with JS friendly versions of their values. */
  replaceSafe?: TMap<Primitive | Primitive[]>;
  /** Replace string values with raw values. */
  replaceRaw?: RollupReplaceOptions;
  /** When true, the version in your package.json will be injected as global named `BUILD_VERSION`. */
  injectPackageVersion?: boolean;
  /** Global properties that will be made available to the bundle outside of the compilation + bundling process. */
  globals: StringMap;
  /** Configuration options for Typescript. */
  tsconfig?: RollupTypescriptOptions;
  /** Configure a sourcemap for the build. Defaults to `true` unless `NODE_ENV` is set to `production`.*/
  sourcemap?: boolean | "hidden" | "inline";
  /** Determines whether or not the output bundles should be minified. Defaults to `true` when `NODE_ENV` is set to `production`. */
  minify?: boolean;
  /** Manually provide named exports for modules that can't resolve them automatically. */
  namedExports?: TMap<string[]>;
  /** Customize how CSS is compiled for your build pipeline. */
  styles?: Omit<PostCssPluginOptions, "minify"> & {
    /** Customize how autoprefixing will be handled for your build pipeline. */
    autoprefix?: boolean | autoprefixer.Options;
  };
}
  & Pick<RollupResolveOptions, "mainFields" | "dedupe" | "preferBuiltins">;

/**
 * Generates a configuration used by Rollup for compiling and bundling front-end applications.
 */
export function createRollupConfig({
  dotenv: useDotenv,
  input,
  output,
  rootDir = process.cwd(),
  framework,
  library,
  packageJson,
  external = [],
  forceInclude = [],
  injectEnv: env = [],
  replaceRaw = {},
  replaceSafe = {},
  injectPackageVersion,
  mainFields,
  dedupe,
  preferBuiltins,
  globals,
  sourcemap,
  tsconfig = {},
  namedExports: customNamedExports = {},
  minify,
  styles = {},
}: CreateRollupConfig): object {

  // enable dotenv when active
  if (useDotenv) {
    dotenv.config(useDotenv === true ? undefined : useDotenv);
  }

  // create a map of values that this plugin will replace
  let replaceMap: TMap<string> = {};

  // create a map of values that will get injected at the top of our JS
  let injectedValues: TMap<unknown> = {
    process: { env: omit(process.env, env) },
  };

  // if package.json contents weren't explicitly provided, attempt to find them
  if (!packageJson) {
    packageJson = require(path.resolve(process.cwd() + "/package.json"));
  }

  // add environment variables to our string replacement and create an injection value
  for (let varname of env) {
    replaceSafe[`process.env.${varname}`] = process.env[varname] || "";
  }

  // "inject" the package.json version when enabled
  if (injectPackageVersion) {
    injectedValues.BUILD_VERSION = packageJson?.version;
  }

  // replace string values with the JS friendly versions
  for (let replaceString in replaceSafe) {
    replaceMap[replaceString] = JSON.stringify(replaceSafe[replaceString]);
  }

  // generate the intro string using the injected values
  let intro = "";
  for (let k in injectedValues) {
    if (/^[a-zA-Z\$\_][\w\$\_]+$/.test(k)) {
      intro += `var ${k} = ${JSON.stringify(injectedValues[k])};\n`;
    } else {
      throw new Error(`Unable to inject value "${k}" as it's an invalid JS variable name.`);
    }
  }

  // apply framework preset configurations (if any)
  switch (framework) {
    case "react":
      tsconfig.jsx = JsxEmit.React;
      break;
    case "preact":
      tsconfig.jsx = JsxEmit.React;
      tsconfig.jsxFactory = "h";
      break;
  }

  // if we're in production, let's try to set some defaults for certain settings
  if (isUndefined(sourcemap)) {
    sourcemap = process.env.NODE_ENV !== "production";
  }

  if (isUndefined(minify)) {
    minify = process.env.NODE_ENV === "production";
  }

  // modify configurations to support libraries that will be published to a package registry
  if (library) {
    // since this is a library, we'll want to include typings in the output
    tsconfig.declaration = true;

    // build the external list using the installed packages
    if (packageJson && Array.isArray(packageJson.dependencies)) {
      const _external = external;
      external = (source, importer, resolved) => {
        return (
          (packageJson!.dependencies!.hasOwnProperty(source)) ||
          (Array.isArray(_external) && _external.includes(source)) ||
          (typeof _external === "function" && _external(source, importer, resolved))
        );
      };
    }
  }

  // split out the postcss configurations and autoprefixer configurations
  let { autoprefix, ...stylesConfig } = styles;
  if (!Array.isArray(stylesConfig.plugins) && autoprefix !== false) {
    stylesConfig.plugins = [autoprefixer(typeof autoprefix !== "boolean" ? autoprefix : undefined)];
  }

  return {
    input,
    output: {
      globals,
      intro,
      sourcemap,
      ...output,
    },
    external,
    plugins: [
      postcss({
        extract: true,
        minimize: minify,
        ...stylesConfig,
      }),
      json(),
      typescript(tsconfig),
      resolve({
        rootDir,
        mainFields,
        dedupe,
        preferBuiltins,
      }),
      commonjs({
        namedExports: {
          ...namedExports,
          ...customNamedExports,
        },
      }),
      replace({
        ...replaceRaw,
        values: (
          replaceRaw.values
            ? { ...replaceRaw.values, ...replaceMap }
            : replaceMap
        ),
      }),
    ],
  };
}