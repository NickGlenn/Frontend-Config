type PackageJSON = {

  name?: string;

  version?: string;

  description?: string;

  keywords?: string[];

  homepage?: string;

  bugs?: string | PackageJSON.Bugs;

  license?: string;

  author?: string | PackageJSON.Author;

  contributors?: string[] | PackageJSON.Author[];

  files?: string[];

  main?: string;

  bin?: string | PackageJSON.BinMap;

  man?: string | string[];

  directories?: PackageJSON.Directories;

  repository?: string | PackageJSON.Repository;

  scripts?: PackageJSON.ScriptsMap;

  config?: PackageJSON.Config;

  dependencies?: PackageJSON.DependencyMap;

  devDependencies?: PackageJSON.DependencyMap;

  peerDependencies?: PackageJSON.DependencyMap;

  optionalDependencies?: PackageJSON.DependencyMap;

  bundledDependencies?: string[];

  engines?: PackageJSON.Engines;

  os?: string[];

  cpu?: string[];

  preferGlobal?: boolean;

  private?: boolean;

  publishConfig?: PackageJSON.PublishConfig;

  typings?: string;

  jest?: object;
};

declare namespace PackageJSON {

  /**
   * An author or contributor
   */
  type Author = {
    name: string;
    email?: string;
    homepage?: string;
  }

  /**
   * A map of exposed bin commands
   */
  type BinMap = {
    [commandName: string]: string;
  }

  /**
   * A bugs link
   */
  type Bugs = {
    email: string;
    url: string;
  }

  type Config = {
    name?: string;
    config?: Object;
  }

  /**
   * A map of dependencies
   */
  type DependencyMap = {
    [dependencyName: string]: string;
  }

  /**
   * CommonJS package structure
   */
  type Directories = {
    lib?: string;
    bin?: string;
    man?: string;
    doc?: string;
    example?: string;
  }

  type Engines = {
    node?: string;
    npm?: string;
  }

  type PublishConfig = {
    registry?: string;
  }

  /**
   * A project repository
   */
  type Repository = {
    type: string;
    url: string;
  }

  type ScriptsMap = {
    [scriptName: string]: string;
  }

}