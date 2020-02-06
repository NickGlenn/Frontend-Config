# Frontend Config Preset

This library is a simple preset for quickly setting up a build pipeline using [Rollup](https://rollupjs.org/guide/en/), [Typescript](http://www.typescriptlang.org/), and [PostCSS](https://postcss.org/).

> This is an opinionated preset! If you are looking for deeper customization than what's provided here, you may want to consider a different solution or a fully custom build pipeline.

- Provides loaders for importing JSON, CSS, SASS/SCSS, and PostCSS with autoprefixing for cross-browser support
- Handles injection of environment variables directly into your build
- Minifies CSS and JS code for production
- Manages CommonJS configurations with support for popular libraries that don't support ESM (like React and React DOM)
- Built in wizard for generating a custom build pipeline for your project

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

## Configuration Options

This config function provided by this library will generate a full Rollup build configuration for you. The only required fields are `input` and `output`.

### input

See https://rollupjs.org/guide/en/#input

### output

See https://rollupjs.org/guide/en/#output

> If the `sourcemap` property is not provided, this preset will automatically enable it when running a ["non-production" build](#isProduction).

### external

See https://rollupjs.org/guide/en/#external

### dotenv

`boolean | DotenvConfigOptions`

Unless explicitly set to `false`, the [dotenv](https://www.npmjs.com/package/dotenv) library will be initialized using the provided (or default) settings. This allows for developers to maintain a local `.env` file with environment variables that will be made available to the build process.

See options for [`DotenvConfigOptions`](https://www.npmjs.com/package/dotenv#options)

### isProduction

`boolean | () => boolean`

Determines whether or not this is a "production" build. By default, this will be set to `true` if your `NODE_ENV` is equal to `"production"`. When configured with a function, the function will be invoked _after_ the configuration has loaded environment variables if [`dotenv`](#dotenv) is enabled.

### allowAutoConfig

`boolean`

Allows the configuration script to inspect your `package.json` and make some configuration decisions on your behalf. For example, if `react` and/or `react-dom` are installed it will automatically set the `namedExports` values required to build these libraries. _Defaults to `true`._

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

Automatically injects a `BUILD_VERSION` variable into your build using the `version` property found in the [`package.json`](#packageJson) file. _Defaults to `true.`_

### exposeEnv

`string[]`

Specify environment variables (by key) that you want injected into your build. _Defaults to `["NODE_ENV"]`._

#### Example

The following configuration example would allow you to use `process.env.NODE_ENV` inside your application:

```ts
exposeEnv: ["NODE_ENV"]
```

### replaceRaw

`RollupReplaceOptions`

Replaces compiled code using [Rollup's replace plugin](https://www.npmjs.com/package/@rollup/plugin-replace). See the documentation for a full [list of available options](https://www.npmjs.com/package/@rollup/plugin-replace#options) and usage.

> **Recommendation:** In most cases you should use [`replaceSafe`](#replaceSafe) instead.

### replaceSafe

`{ [key: string]: null | boolean | number | string }`

Replace compiled code that matches the `string` key in the object. This option operates the same way as `replaceRaw`, but will apply `JSON.stringify()` to each value in the map.

#### Example

For example, you could replace every instance of a placeholder value like `__FOO__` with a `string` literal, like `"bar"`.

```ts
replaceSafe: { __FOO__: "bar" }

// someFile.ts (source)

declare const __FOO__: string;
var someValue = __FOO__;

// someFile.js (compiled)

var someValue = "bar";
```

### tsconfig

Provide configuration overrides for Typescript. _By default, this will load values from your project's `tsconfig.json` file._ See the plugin's [documentation for options](https://www.npmjs.com/package/@rollup/plugin-typescript#options) and usage details.

> **Note:** This preset uses the field name `jsonFile` for configuring the `tsconfig.json` filepath, instead of `tsconfig`. This means you can change the `tsconfig.json` filepath using `tsconfig: { jsonFile: "path/to/tsconfig.json" }`.

