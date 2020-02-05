# Frontend Config Preset

This library is a simple preset for quickly setting up a build pipeline using [Rollup](https://rollupjs.org/guide/en/), [Typescript](http://www.typescriptlang.org/), and [PostCSS](http://www.typescriptlang.org/).

> This is an opinionated preset! If you are looking for deeper customization, then you may want to consider a different solution or custom build pipeline.

- Provides loaders for [JSON](https://www.npmjs.com/package/@rollup/plugin-json), [CSS, SASS/SCSS, and PostCSS](https://www.npmjs.com/package/rollup-plugin-postcss) with [autoprefixing](https://www.npmjs.com/package/autoprefixer) for cross-browser support
- Automatically inject environment variables directly into your build
- Minifies CSS and JS code for production
- Handles CommonJS configuration that is required to compile React
- Provides an initialization script for setting up your build pipeline automatically

## Usage

Create a new folder, set up a `package.json` file and then install this library using `npm`. If you want to short hand this, you can run the following commands in terminal:

```bash
mkdir my-project
cd my-project
npm init
npm i -D @nickglenn/frontend-config
```

After you've set up a `package.json` and have installed the library. You can run the initialization script using the following command:

```bash
npx ng-frontend-init
```

## Options

Documentation coming soon.