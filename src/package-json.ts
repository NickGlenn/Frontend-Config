export type PackageJSON = {

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

export namespace PackageJSON {

  /**
   * An author or contributor
   */
  export type Author = {
    name: string;
    email?: string;
    homepage?: string;
  };

  /**
   * A map of exposed bin commands
   */
  export type BinMap = {
    [commandName: string]: string;
  };

  /**
   * A bugs link
   */
  export type Bugs = {
    email: string;
    url: string;
  };

  export type Config = {
    name?: string;
    config?: Object;
  };

  /**
   * A map of dependencies
   */
  export type DependencyMap = {
    [dependencyName: string]: string;
  };

  /**
   * CommonJS package structure
   */
  export type Directories = {
    lib?: string;
    bin?: string;
    man?: string;
    doc?: string;
    example?: string;
  };

  export type Engines = {
    node?: string;
    npm?: string;
  };

  export type PublishConfig = {
    registry?: string;
  };

  /**
   * A project repository
   */
  export type Repository = {
    type: string;
    url: string;
  };

  export type ScriptsMap = {
    [scriptName: string]: string;
  };

}