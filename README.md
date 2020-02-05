# Frontend Config Preset

This library is a simple preset for quickly setting up a build pipeline using Rollup, Typescript, and PostCSS.

> This is an opinionated preset! If you are looking for deeper customization, then you may want to consider configuring your build pipeline yourself.

- Provides loaders for JSON, CSS, SASS/SCSS, and PostCSS with autoprefixing for cross-browser support
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