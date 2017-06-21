import * as ts from "typescript";
import { Path } from "../interfaces";
export declare const useCaseSensitiveFileNames: boolean;
export declare const getCanonicalFileName: (fileName: string) => string;
export declare const defaultLibLocation: ts.Path;
export declare function normalizePath(path: string): string;
export declare function isWithin(rootPath: Path, path: Path): boolean;
export declare function relativePathWithin(root: Path, path: Path): string | undefined;
export declare function toPath(fileName: string, basePath?: Path): Path;
export { getDirectoryPath } from "typescript";
declare module "typescript" {
    function getDirectoryPath(path: ts.Path): ts.Path;
    function getDirectoryPath(path: string): string;
    function normalizePath(path: string): string;
    function toPath(fileName: string, basePath: string, getCanonicalFileName: (path: string) => string): ts.Path;
}
