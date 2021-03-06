export declare const FSTree: FSTree.Static;
export declare const BroccoliPlugin: BroccoliPlugin.Static;
export declare const walkSync: WalkSync;
export declare const md5Hex: MD5Hex;
export declare const heimdall: Heimdall;
export interface Token {
    __tokenBrand: any;
}
export interface Heimdall {
    start(name: string): Token;
    stop(token: Token): void;
}
export declare type MD5Hex = (str: string) => string;
export declare namespace BroccoliPlugin {
    interface PluginOptions {
        name?: string;
        annotation?: string;
        persistentOutput?: boolean;
    }
    interface Plugin {
        inputPaths: string[];
        outputPath: string;
        cachePath: string;
    }
    interface Static {
        new (inputNodes: any[], options?: any): Plugin;
    }
}
export interface WalkSync {
    (path: string, options?: any): string[];
    entries(path: string, options?: any): WalkSync.Entry[];
}
export declare namespace WalkSync {
    type Row = string | RegExp[];
    interface Entry {
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
export declare namespace FSTree {
    type Op = "unlink" | "create" | "mkdir" | "rmdir" | "change";
    type PatchOp = [Op, string, WalkSync.Entry];
    interface Static {
        fromEntries(entries: WalkSync.Entry[], options?: {
            sortAndExpand?: boolean;
        }): FSTree;
    }
}
