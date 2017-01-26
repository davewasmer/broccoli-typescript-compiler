export const FSTree: FSTree.Static = require("fs-tree-diff");
export const BroccoliPlugin: BroccoliPlugin.Static = require("broccoli-plugin");
export const walkSync: WalkSync = require("walk-sync");
export const md5Hex: MD5Hex = require("md5-hex");
export const findup: FindUp = require("findup");
export const getCallerFile: GetCallerFile = require("get-caller-file");
export const heimdall: Heimdall = require("heimdalljs");

declare function require(id: string): any;

export interface Token {}
export interface Heimdall {
  start(name: string): Token;
  stop(token: Token);
}

export interface MD5Hex {
  (str: string): string;
}

export interface GetCallerFile {
  (pos?: number): string;
}

export interface FindUp {
  sync(dir: string, file: string): string;
}

export namespace BroccoliPlugin {
  export interface PluginOptions {
    name?: string;
    annotation?: string;
    persistentOutput?: boolean;
  }

  export interface Plugin {
    inputPaths: string[];
    outputPath: string;
    cachePath: string;
  }

  export interface Static {
    new (inputNodes: any[], options?: any): Plugin;
  }
}

export interface WalkSync {
  (path: string, options?: WalkSync.Options): string[];
  entries(path: string, options?: WalkSync.Options): WalkSync.Entry[];
}

export namespace WalkSync {
  export type Row = string | RegExp[];

  export type Options = {
    globs?: (string | { match(): boolean })[];
  };

  export interface Entry {
    relativePath: string;
    basePath: string;
    fullPath: string;
    mode: number;
    size: number;
    mtime: Date;
    isDirectory(): boolean;
  }
}

export interface FSTree {
  calculatePatch(next: FSTree, isUnchanged?: (a: WalkSync.Entry, b: WalkSync.Entry) => {}): FSTree.PatchOp[];
}

export namespace FSTree {
  export type Op = "unlink" | "create" | "mkdir" | "rmdir" | "change";

  export type PatchOp = [Op, string, WalkSync.Entry];

  export interface Static {
    fromEntries(entries: WalkSync.Entry[], options?: {
      sortAndExpand?: boolean
    }): FSTree;
  }
}
