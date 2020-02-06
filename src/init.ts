#!/usr/bin/env node

import { promisify } from "util";
import { exec } from "child_process";
import { join } from "path";
import { existsSync, writeFileSync } from "fs";
import * as inquirer from "inquirer";

const thisPkg = require("../package.json");
const cwd = process.cwd();

/**
 * Quickly formats the path/directory using the current working directory.
 */
function dir(path: string) {
  return join(cwd, path);
}

/**
 * Logs something to console, then provides a function for checking it off.
 */
function checkpoint(message: string, fn: { (): Promise<void> }) {
  process.stdout.write(message + "...");
  return fn()
    .then(() => {
      process.stdout.write("\x1b[42m\x1b[30mCOMPLETE!\x1b[0m\n");
    })
    .catch(() => {
      process.stdout.write("\x1b[41m\x1b[30mFAILED\x1b[0m\n");
    });
}

/**
 * Runs a command in the current working directory.
 */
const run = promisify(exec);

(async function main() {

  // names of packages to install
  let installDevPackages: string[] = [];

  const packageExists = existsSync(join(process.cwd(), "package.json"));
  const rollupExists = existsSync(dir("rollup.config.ts"));
  const tsconfigExists = existsSync(dir("tsconfig.json"));
  const tslintExists = existsSync(dir("tslint.json"));

  // if package.json exists, load it in
  let packageJson: PackageJSON = { name: "" };
  if (packageExists) {
    packageJson = require(dir("package.json"));
  }

  const answers = await inquirer.prompt([
    {
      name: "projectName",
      message: "What is the name of your project?",
      validate(value) {
        if (/^[a-zA-Z\$\_][a-zA-Z0-9\$\_]+$/.test(value)) {
          return true;
        }

        return "You must provide a value that would be a valid JS variable name.";
      },
    },
    {
      name: "srcFolder",
      message: "What is the filepath to your source code directory?",
      default: "src",
    },
    {
      name: "distFolder",
      message: "What is the filepath to your dist(ribution) or build directory?",
      default: "dist",
    },
    {
      type: "list",
      name: "projectType",
      message: "Is this project a library or a standalone app?",
      choices: ["library", "app", "site"],
      default: "app",
    },
    {
      type: "list",
      name: "framework",
      message: "Are you using one of these supported frameworks for your app?",
      choices: ["react", "preact", "none of these"],
      default: "react",
    },
    {
      type: "confirm",
      name: "jest",
      default: !packageJson.jest,
      message: (
        packageJson.jest
          ? "Looks like you already have jest configured. Do you want me to replace this configuration?"
          : "Would you like me to set up testing using Jest?"
      ),
    },
    {
      type: "confirm",
      name: "scripts",
      message: "Should I set up NPM scripts for building, linting and testing your project?",
      default: true,
    },
    {
      type: "confirm",
      name: "createRollupConfig",
      default: !rollupExists,
      message: (
        rollupExists
          ? "A rollup.config.ts file already exists, should I overwrite it?"
          : "Would you like me to create a rollup.config.ts file?"
      ),
    },
    {
      type: "confirm",
      name: "createTsConfig",
      default: !tsconfigExists,
      message: (
        tsconfigExists
          ? "A tsconfig.json file already exists, should I overwrite it?"
          : "Would you like me to create a tsconfig.json file?"
      ),
    },
    {
      type: "confirm",
      name: "setupLint",
      default: !tslintExists,
      message: (
        tslintExists
          ? "A tslint.json file already exists, should I overwrite it?"
          : "Would you like me to setup linting and create a tslint.json file?"
      ),
    },
  ]);


  // set up additional options for TS now in case they're needed...
  let additionalTsOptions: StringMap = {};
  let entryFile = `./${answers.srcFolder}/index.ts`;
  let distFile = `./${answers.distFolder}/${answers.projectType}.js`;
  let framework = answers.framework;

  // install self if necessary
  if (!packageJson.devDependencies || !thisPkg.devDependencies[thisPkg.name]) {
    installDevPackages.push(thisPkg.name);
  }

  // no scripts? create an emprty object for them
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // if the dist file isnt set up, set it for the user
  if (!packageJson.main) {
    packageJson.main = distFile;
  }

  // set up TS typings for the package as well
  if (!packageJson.typings) {
    packageJson.typings = distFile.replace(/(\.js)$/, ".d.ts");
  }

  // if we're using a framework, pre-install some packages and configure TS for us
  switch (framework) {
    case "react":
      additionalTsOptions.jsx = "react";
      installDevPackages.push("react", "react-dom", "@types/react", "@types/react-dom");
      entryFile += "x";
      break;
    case "preact":
      additionalTsOptions.jsx = "react";
      additionalTsOptions.jsxFactory = "h";
      installDevPackages.push("preact");
      entryFile += "x";
      break;
    default:
      framework === "none";
  }

  // create .gitignore for the user
  if (!existsSync(dir(".gitignore"))) {
    await checkpoint("Creating .gitignore file with sensible defaults", async () => {
      writeFileSync(dir(".gitignore"), `
### Node ###
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Build folder
${answers.distFolder}/${answers.projectType}*.js
${answers.distFolder}/${answers.projectType}*.css
${answers.distFolder}/${answers.projectType}*.d.ts
${answers.distFolder}/${answers.projectType}*.map
`, "utf-8");
    });
  }

  // create rollup.config.json
  if (answers.createRollupConfig) {

    // set up build script
    if (answers.scripts) {
      packageJson.scripts.build = "rollup -c rollup.config.ts";
    }

    await checkpoint("Creating rollup.config.js file using this library", async () => {
      writeFileSync(dir("rollup.config.ts"),
        `import config from "${thisPkg.name}";

module.exports = config({
  input: "${entryFile}",
  output: {
    file: "${distFile}",
    name: "${answers.projectName}",
    format: "${answers.projectType === "library" ? "cjs" : "iife"}",
  },
  isLibrary: ${answers.projectType === "library" ? "true" : "false"},
});
  `
        , "utf-8");
    });

  }

  // create tsconfig.json
  if (answers.createTsConfig) {
    await checkpoint("Creating tsconfig.json file with some opinionated settings", async () => {
      writeFileSync(dir("tsconfig.json"), JSON.stringify({
        compilerOptions: {
          target: "es5",
          noImplicitAny: true,
          noUnusedLocals: true,
          noImplicitThis: true,
          strictNullChecks: true,
          noImplicitReturns: true,
          outDir: answers.distFolder,
          declaration: answers.projectType === "Library",
          ...additionalTsOptions,
          lib: [
            "dom",
            "es2015",
            "es2016",
            "es2017",
            "es2018",
            "es2019",
            "es2020",
          ],
        },
        include: [
          `${answers.srcFolder}/**/*`,
        ],
        exclude: [
          "node_modules",
        ],
      }, null, 2), "utf-8");
    });
  }

  // set the package.json to private if this is not a library
  if (answers.projectType !== "library") {
    packageJson.private = true;
  }

  // create tslint.json
  if (answers.setupLint {

    if (answers.scripts) {
      packageJson.scripts.lint = "tslint -p .";
    }

    installDevPackages.push("tslint", "@helpfulhuman/tslint-rules");

    await checkpoint("Creating tslint.json file so your code stays consistent and clean", async () => {
      writeFileSync(dir("tslint.json"), JSON.stringify({
        extends: "@helpfulhuman/tslint-rules",
      }, null, 2), "utf-8");
    });
  }

  // set up Jest
  if (answers.jest) {
    installDevPackages.push("jest", "ts-jest", "@types/jest");

    if (answers.scripts) {
      packageJson.scripts.test = "jest";
    }

    packageJson.jest = {
      testEnvironment: "node",
      notify: false,
      silent: true,
      roots: [
        `<rootDir>/${answers.srcFolder}`,
      ],
      testRegex: ".test\\.tsx?$",
      transform: {
        "^.+\\.tsx?$": "ts-jest",
      },
      moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node",
      ],
    };
  }

  // write the package.json file back before installing deps
  await checkpoint("Commiting any outstanding changes needed for package.json", async () => {
    writeFileSync(dir("package.json"), JSON.stringify(packageJson, null, 2), "utf-8");
  });

  // install Node dependencies
  if (installDevPackages.length > 0) {
    await checkpoint("Installing devDependencies using NPM", async () => {
      await run(`npm i -D ${installDevPackages.join(" ")}`);
    });
  }

  process.stdout.write("\nAll done!");

})().catch(err => {
  console.error(err);
  process.exit(1);
});