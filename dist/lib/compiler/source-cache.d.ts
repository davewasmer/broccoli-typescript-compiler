import * as ts from "typescript";
import { Path, PathResolver } from "../interfaces";
export default class SourceCache {
    private resolver;
    private options;
    private bucketKey;
    private sourceFiles;
    constructor(resolver: PathResolver, options: ts.CompilerOptions);
    updateOptions(options: ts.CompilerOptions): void;
    getSourceFile(fileName: string): ts.SourceFile | undefined;
    getSourceFileByPath(fileName: string, path: Path): ts.SourceFile | undefined;
    releaseUnusedSourceFiles(program: ts.Program): void;
    releaseAll(): void;
    private resolve(fileName);
    private getSourceFileByResolution(resolution, fileName, path);
    private getOrUpdateSourceFile(fileName, path, content);
    private updateSourceFile(existing, fileName, path, content);
    private createSourceFile(fileName, path, content);
}
