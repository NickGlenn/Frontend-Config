# Frontend Config Preset

This library is a simple preset for quickly setting up a build pipeline using [Rollup](https://rollupjs.org/guide/en/), [Typescript](http://www.typescriptlang.org/), and [PostCSS](https://postcss.org/).

> This is an opinionated preset! If you are looking for deeper customization than what's provided here, you may want to consider a different solution or a fully custom build pipeline.

- Provides loaders for importing JSON, CSS, SASS/SCSS, and PostCSS with autoprefixing for cross-browser support
- Includes support for `.env` files
- Handles injection of environment variables directly into your build
- Minifies CSS and JS code for production
- Built in wizard for generating a custom build pipeline for your project
- Automatic configuration support for popular libraries (like [React](#react-support) and [Preact](#preact-support))

## Usage

Create a new folder, set up a `package.json` file and then install this library using `npm`. If you want to short hand this, you can run the following commands in terminal:

```bash
mkdir my-project
cd my-project
npm init
npm i -D @nickglenn/frontend-config
```

### Automatic Set Up

After you've set up a `package.json` and have installed the library. You can run the initialization script using the following command:

```bash
npx ng-frontend-init
```

### Manual Set Up

Assuming you're familiar with setting up a Typescript project, you can simply add a `rollup.config.js` or `rollup.config.ts` file and fill it out with the following:

```ts
import config from "@nickglenn/frontend-config";

module.exports = config({
  /** enter configuration options here */
});
```

## Base Configuration

This config function provided by this library will generate a full Rollup build configuration for you. The only required fields are `input` and `output`. All [Rollup options](https://rollupjs.org/guide/en/#big-list-of-options) are available to you, with exception of [plugins](#plugins) which are handled differently.

### input

See https://rollupjs.org/guide/en/#input

### output

See https://rollupjs.org/guide/en/#output

> If the `sourcemap` property is not provided, this preset will automatically enable it when running a ["non-production" build](#isProduction).

### external

See https://rollupjs.org/guide/en/#external

> If `isLibrary` is set to `true`, the `external` array will automatically be filled in using the names of all the packages found in the `"dependencies"` map.

### dotenv

`null | DotenvConfigOptions`

Unless explicitly set to `null`, the [dotenv](https://www.npmjs.com/package/dotenv) library will be initialized using the provided (or default) settings. This allows for developers to maintain a local `.env` file with environment variables that will be made available to the build process.

See options for [`DotenvConfigOptions`](https://www.npmjs.com/package/dotenv#options)

### isProduction

`boolean | () => boolean`

Determines whether or not this is a "production" build. By default, this will be set to `true` if your `NODE_ENV` is equal to `"production"`. When configured with a function, the function will be invoked _after_ the configuration has loaded environment variables if [`dotenv`](#dotenv) is enabled.

### allowAutoConfig

`boolean`

Allows the configuration script to inspect your `package.json` and make some configuration decisions on your behalf. _Defaults to `true`._

See the [Automatic Configuration](#automatic-configuration) section below for more information

### missingExports

`string[]`

Packages that don't support ESM compatible exports can cause issues for [Rollup's CommonJS plugin](https://www.npmjs.com/package/@rollup/plugin-commonjs). This can be solved manually using [`namedExports`](#namedExports). However, this can be tedious to set up as it involves starting the build, identifying the missing export that crashed the build, add the named export to the list, and then repeating this project until your build succeeds. With this option, you can simply specify a package name and the configuration tool will attempt to handle the rest.

#### Example

Let's say you get an error like the following:

```
bundles ./src/index.tsx → dist/app.js...
[!] Error: 'exactProp' is not exported by node_modules/@material-ui/utils/index.js
https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module
node_modules/@material-ui/styles/esm/StylesProvider/StylesProvider.js (5:9)
3: import React from 'react';
4: import PropTypes from 'prop-types';
5: import { exactProp } from '@material-ui/utils';
            ^
6: import createGenerateClassName from '../createGenerateClassName';
7: import { create } from 'jss';
Error: 'exactProp' is not exported by node_modules/@material-ui/utils/index.js
```

You can resolve this quickly by passing the following option:

```ts
missingExports: ["@material-ui/utils"],
```

### isLibrary

`boolean`

Sets up the bundle to be used as a library, rather than a standalone bundle. I will automatically populated the `external` property with any `dependencies` listed in your `package.json` file and configure Typescript to include declarations alongside your outputted bundle files. _Defaults to `false`._

### rootDir

`string`

Defines the root directory that modules and other files will be resolved from. _Defaults to the current working directory using `process.cwd()`._

> **Note:** This setting is also passed directly to Rollup's `node-resolve` plugin used for resolving modules installed by package managers.

### packageJson

Optionally override values loaded from the project's `package.json` file. See [npm's documentation for `package.json`](https://docs.npmjs.com/files/package.json) for the full list of options.

### inject

`object`

Inject values directly into the top of your bundle. The top-level keys _must_ be Javascript safe variable names!

#### Example

The following configuration would inject the following values into your build.

```ts
inject: { foo: { bar: "baz" } }

// would be injected as

var foo = {"bar": "baz"};
```

### injectVersion

Automatically injects a variable into your build using the `version` property found in the [`package.json`](#packageJson) file. _Defaults to `BUILD_VERSION.`_

```ts
injectVersion: "APP_VERSION"

// compiled.js

var APP_VERSION = "x.x.x";
```

### exposeEnv

`string[]`

Specify environment variables (by key) that you want injected into your build. _Defaults to `["NODE_ENV"]`._

#### Example

The following configuration example would allow you to use `process.env.NODE_ENV` inside your application:

```ts
exposeEnv: ["NODE_ENV"]
```

### replace

`{ [key: string]: null | boolean | number | string }`

Replace compiled code that matches the `string` key in the object using [Rollup's replace plugin](https://www.npmjs.com/package/@rollup/plugin-replace). This option will apply `JSON.stringify()` to each value in the map, making it a more streamlined alternative to configuring the replace plugin yourself.

#### Example

You could easily replace every instance of a placeholder value like `__FOO__` with a `string` literal, like `"bar"`.

```ts
replace: { __FOO__: "bar" }

// someFile.ts (source)

declare const __FOO__: string;
var someValue = __FOO__;

// someFile.js (compiled)

var someValue = "bar";
```

### minify

`boolean`

When set to `true`, the bundles will be uglified/minified. If nothing is provided, this will be set to `true` if your `NODE_ENV` is equal to `"production"`.

### autoprefixCSS

Configure the [autoprefixer](https://www.npmjs.com/package/autoprefixer) PostCSS plugin and passes it the [`styles`](#styles) plugin configuration. Pass `null` if you don't wish to use automatic vendor prefixing.

### plugins

See [Plugin Configuration](#plugin-configuration)

## Plugin Configuration

This preset includes a number of popular Rollup plugins and sets up a base configuration for each depending on your other settings. You can customize or override the plugins using either a plugin configuration object or a configuration function.

### Using an config object

If you do not wish to change the order of the plugins or add any new plugins to the mix, you can use a configuration object. Each key in the object corresponds to a plugin, and the value is the option argument that is passed to that plugin.  The following table lists all of the fields available in the map and the plugin that they correlate to.

> **Note:** You can disabled _any_ plugin from being added by providing `null` as the value.

| Field | Plugin | Description |
| ------|--------|-------------|
| `styles` | [rollup-plugin-postcss](https://www.npmjs.com/package/rollup-plugin-postcss) | Handles importing of CSS, SCSS, and LESS files while also applying PostCSS plugins. |
| `inject` | | Internally generated plugin for injecting values. See [inject](#inject) |
| `json` | [@rollup/plugin-json](https://www.npmjs.com/package/@rollup/plugin-json) |  Allows importing of JSON files. |
| `typescript` | [rollup-plugin-typescript](https://www.npmjs.com/package/rollup-plugin-postcss) | Compiles Typescript files. Currently using the legacy plugin due to issues with `@rollup/plugin-typescript`. |
| `replace` | [@rollup/plugin-replace](https://www.npmjs.com/package/@rollup/plugin-replace) | Replaces values in your files at build time. Required for [`replace`](#replace) and [`exposeEnv`](#exposeEnv). |
| `commonjs` | [@rollup/plugin-commonjs](https://www.npmjs.com/package/@rollup/plugin-commonjs) | Handles importing of CommonJS packages as ES modules. A _must have_ for most projects. Required for [`missingExports`](#missingExports). |
| `alias` | [@rollup/plugin-alias](https://www.npmjs.com/package/@rollup/plugin-alias) | Used to alias module imports to other module names or filepaths. |
| `resolve` | [@rollup/plugin-node-resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve) | Handles resolution of packages installed using a NPM or similar. Another _must have_ for most projects. |
| `strip` | [@rollup/plugin-strip](https://www.npmjs.com/package/@rollup/plugin-strips) | Used to optimize builds by stripping out debug statements. |
| `uglify` | [rollup-plugin-uglify](https://www.npmjs.com/package/rollup-plugin-uglify) | Minifies and compresses the resulting JS modules for a build. Required for [`minify`](#minify). |

### Using a config function

`(plugins: PluginFunctionMap) => Plugin[]`

For users wishing to alter the plugin setup with greater control, you can use a function that accepts the current configuration created by the preset along with some helper methods for constructing each plugin.

```tsx
import config from "@nickglenn/frontend-config";
import somePlugin from "some-other-plugin";

module.exports = config({
  plugins: ({ inject, typescript, uglify }) => ([
    inject({
      foo: "bar",
    }),
    typescript(),
    somePlugin(),
    uglify({}),
  ]),
});
```

## Automatic Configurations

When [`allowAutoConfig`](#allowAutoConfig) is enabled, this preset will scan your `package.json` file for whatever dependencies you have installed and can make configurations on your behalf for certain libraries and frameworks.

### React Support

Due to how React is written, it does not comply with Rollup's ES module requirement and requires some additional set up using Rollup's CommonJS plugin. Rather than having to deal with this manually, this preset will construct the [`missingExports`](#missingExports) option for you, adding `"react"`, `"react-dom"`, `"react-is"`, and `"prop-types"` to the list.

### Preact Support

Unlike React, Preact plays extremely well with Typescript and Rollup with no additional configuration. However, to use React libraries with Preact, you need to use Preact's `"preact/compat"` module. This preset handles that configuration for you, by aliasing `"react"` and `"react-dom"` to the aforementioned `"preact/compat"` library.