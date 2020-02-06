import { CreateRollupConfig } from "../rollup";
import { Plugin } from "rollup";
import * as autoprefixer from "autoprefixer";
import { isUndefined } from "../utils";
import { PostCssPluginOptions } from "rollup-plugin-postcss";
const postcss = require("rollup-plugin-postcss");

/**
 * Configures the PostCSS plugin for Rollup.
 */
export function setupPostCSS({ styles, minify }: CreateRollupConfig): null | Plugin {
  // if styles is explicitly disabled, bail
  if (styles === false) {
    return null;
  }

  // if styles is set to true, default it to an empty object
  if (isUndefined(styles) || styles === true) {
    styles = {};
  }

  // create the config based on this preset's opinions
  let config: PostCssPluginOptions = {
    extract: true,
    minimize: minify,
    plugins: [],
  };

  // if autoprefix is not explicitly disabled, configure it
  if (styles.autoprefix !== false) {
    config.plugins!.push(autoprefixer(styles.autoprefix !== true ? styles.autoprefix : undefined));
  }

  // remove autoprefix settings (if any) and allow end user to override settings
  delete styles!.autoprefix;
  Object.assign(config, styles);

  // return configured plugin
  return postcss(config);
}