import * as ts from "typescript";
import SourceCache from "./compiler/source-cache";
import { NormalizedOptions, Path } from "./interfaces";
export default class Compiler {
    inputPath: Path;
    outputPath: Path;
    options: NormalizedOptions;
    private resolver;
    private rootPath;
    private input;
    private configParser;
    private sourceCache;
    private output;
    private program;
    constructor(inputPath: Path, outputPath: Path, options: NormalizedOptions);
    compile(): void;
    protected parseConfig(): ts.ParsedCommandLine;
    protected getSourceCache(options: ts.CompilerOptions): SourceCache;
    protected createProgram(config: ts.ParsedCommandLine, sourceCache: SourceCache): ts.Program;
    protected emitDiagnostics(program: ts.Program): void;
    protected emitProgram(program: ts.Program): void;
    protected patchOutput(): void;
    protected resetCaches(): void;
}
