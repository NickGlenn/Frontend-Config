declare module "@rollup/plugin-strip" {
  import { Plugin } from "rollup";
  export default function (options: RollupStripPlugin): Plugin;
  export type RollupStripPlugin = {
    debugger?: boolean;
    functions?: string[];
    labels?: string[];
    sourceMap?: boolean;
  };
}