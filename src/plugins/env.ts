import { CreateRollupConfig } from "../rollup";
import { pick, isUndefined } from "../utils";
import { Plugin } from "rollup";

const replace = require("@rollup/plugin-replace");

/**
 * Sets up the environment variables for the build pipeline and augments the maps
 * of values that will replaced or injected into the build.
 */
export function setupVarInjection({
  exposeEnv = ["NODE_ENV"],
  injectVersion,
  packageJson,
  tsconfig = {},
  isLibrary: library,
  external = [],
  replaceRaw = {},
  replaceSafe = {},
  inject: injectMap = {},
}: CreateRollupConfig) {

  // values that will be replaced in the build
  let replaceMap: StringMap = {};

  // set the NODE_ENV to default by default
  if (isUndefined(process.env.NODE_ENV)) {
    process.env.NODE_ENV = "development";
  }

  // add environment variables to our string replacement and create an injection value
  for (let varname of exposeEnv) {
    if (process.env[varname]) {
      replaceMap[`process.env.${varname}`] = JSON.stringify(process.env[varname]);
    } else {
      throw new Error(`Unable to find environmental variable "${varname}".`);
    }
  }

  // inject the `process.env` object for environment variables
  injectMap.process = { env: pick(process.env, exposeEnv) };

  // "inject" the package.json version when enabled
  if (injectVersion) {
    injectMap.BUILD_VERSION = packageJson?.version;
  }

  // replace string values with the JS friendly versions
  for (let replaceString in replaceSafe) {
    replaceMap[replaceString] = JSON.stringify(replaceSafe[replaceString]);
  }

  // create a plugin to inject values
  let inject: Plugin = { name: "injectVars", intro: "" };
  for (let k in injectMap) {
    if (/^[a-zA-Z\$\_][\w\$\_]+$/.test(k)) {
      inject.intro += `var ${k} = ${JSON.stringify(injectMap[k])};\n`;
    } else {
      throw new Error(`Unable to inject value "${k}" as it's an invalid JS variable name.`);
    }
  }

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

  // return the values
  return {
    external,
    inject,
    replace: replace({
      ...replaceRaw,
      values: (
        replaceRaw.values
          ? { ...replaceRaw.values, ...replaceMap }
          : replaceMap
      ),
    }),
  };
}