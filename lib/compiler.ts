import * as ts from "typescript";
import ConfigParser from "./compiler/config-parser";
import createCompilerHost from "./compiler/create-compiler-host";
import formatDiagnosticsHost from "./compiler/format-diagnostics-host";
import Input from "./compiler/input-io";
import OutputPatcher from "./compiler/output-patcher";
import PathResolver from "./compiler/path-resolver";
import SourceCache from "./compiler/source-cache";
import { heimdall } from "./helpers";
import { NormalizedOptions, Path } from "./interfaces";

export default class Compiler {
  private resolver: PathResolver;
  private rootPath: Path;
  private input: Input;
  private configParser: ConfigParser;
  private sourceCache: SourceCache | undefined;
  private output: OutputPatcher;
  private program: ts.Program | undefined;

  constructor(public inputPath: Path,
              public outputPath: Path,
              public options: NormalizedOptions) {
    const rootPath = this.rootPath = options.rootPath;
    const resolver = this.resolver = new PathResolver(rootPath, inputPath);
    const input = this.input = new Input(resolver);
    this.configParser = new ConfigParser(rootPath,
      options.rawConfig, options.configFileName, options.compilerOptions, input);
    this.output = new OutputPatcher(outputPath);
  }

  public compile() {
    const config = this.parseConfig();

    const sourceCache = this.getSourceCache(config.options);

    const program = this.createProgram(config, sourceCache);

    this.emitDiagnostics(program);

    sourceCache.releaseUnusedSourceFiles(program);

    this.emitProgram(program);

    this.patchOutput();

    this.resetCaches();
  }

  protected parseConfig() {
    const token = heimdall.start("TypeScript:parseConfig");
    const config = this.configParser.parseConfig();
    heimdall.stop(token);
    return config;
  }

  protected getSourceCache(options: ts.CompilerOptions) {
    let sourceCache = this.sourceCache;
    if (sourceCache === undefined) {
      sourceCache = this.sourceCache = new SourceCache(this.resolver, options);
    } else {
      sourceCache.updateOptions(options);
    }
    return sourceCache;
  }

  protected createProgram(config: ts.ParsedCommandLine, sourceCache: SourceCache): ts.Program {
    const token = heimdall.start("TypeScript:createProgram");

    const host = createCompilerHost(this.rootPath, this.input, sourceCache, config.options);

    const oldProgram = this.program;
    const program = ts.createProgram(config.fileNames, config.options, host, oldProgram);
    this.program = program;

    heimdall.stop(token);
    return program;
  }

  protected emitDiagnostics(program: ts.Program) {
    // this is where bindings are resolved and typechecking is done
    const token = heimdall.start("TypeScript:emitDiagnostics");
    const diagnostics = ts.getPreEmitDiagnostics(program);
    heimdall.stop(token);
    logDiagnostics(diagnostics);
  }

  protected emitProgram(program: ts.Program) {
    const token = heimdall.start("TypeScript:emitProgram");
    const { input, output } = this;
    const emitResult = program.emit(undefined, (fileName: string, data: string) => {
      /* tslint:disable:no-console */
      const relativePath = input.relativePath(fileName);
      if (relativePath) {
        output.add(relativePath, data);
      }
    });
    heimdall.stop(token);
    logDiagnostics(emitResult.diagnostics);
  }

  protected patchOutput() {
    const token = heimdall.start("TypeScript:patchOutput");
    this.output.patch();
    heimdall.stop(token);
  }

  protected resetCaches() {
    this.resolver.reset();
    this.input.reset();
  }
}

function logDiagnostics(diagnostics: ts.Diagnostic[] | undefined) {
  if (!diagnostics) {
    return;
  }
  ts.sys.write(ts.formatDiagnostics(diagnostics, formatDiagnosticsHost));
}
