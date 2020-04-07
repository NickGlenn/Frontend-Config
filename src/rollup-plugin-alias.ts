declare module "@rollup/plugin-alias" {
  export type RollupAliasOptions = {
    entries: EntryMap | EntryList;
  };

  type EntryMap = { [key: string]: string };

  type EntryList = {
    find: string | RegExp;
    replacement: string;
  }[];
}

