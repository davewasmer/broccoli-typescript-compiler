import { ReadableDir, Tree } from "broccoli-test-helper";
import { CompilerOptionsConfig, TypeScriptConfig } from "../lib/index";
export interface ProjectRunnerConfig {
    typescriptDir: string;
}
export default class ProjectRunner {
    rootDir: string;
    projectJsonDir: string;
    constructor(config: ProjectRunnerConfig);
    each(callback: (project: Project) => void): void;
    shouldSkip(basename: string, config: ProjectConfig): boolean | undefined;
}
export declare class Project {
    rootDir: string;
    basename: string;
    config: ProjectConfig;
    baselineDir: string;
    constructor(rootDir: string, basename: string, config: ProjectConfig);
    each(callback: (project: ProjectWithModule) => void): void;
    readonly dir: string;
    readonly tsconfigFile: string | undefined;
    readonly inputFiles: string[] | undefined;
    readonly compilerOptions: {
        [k: string]: any;
        charset?: string | undefined;
        declaration?: boolean | undefined;
        declarationDir?: string | undefined;
        diagnostics?: boolean | undefined;
        emitBOM?: boolean | undefined;
        inlineSourceMap?: boolean | undefined;
        inlineSources?: boolean | undefined;
        jsx?: "preserve" | "react" | "react-native" | undefined;
        reactNamespace?: string | undefined;
        listFiles?: boolean | undefined;
        locale?: string | undefined;
        mapRoot?: string | undefined;
        module?: "none" | "commonjs" | "amd" | "umd" | "system" | "es6" | "es2015" | undefined;
        newLine?: "CRLF" | "LF" | undefined;
        noEmit?: boolean | undefined;
        noEmitHelpers?: boolean | undefined;
        noEmitOnError?: boolean | undefined;
        noImplicitAny?: boolean | undefined;
        noImplicitThis?: boolean | undefined;
        noUnusedLocals?: boolean | undefined;
        noUnusedParameters?: boolean | undefined;
        noLib?: boolean | undefined;
        noResolve?: boolean | undefined;
        skipDefaultLibCheck?: boolean | undefined;
        skipLibCheck?: boolean | undefined;
        outFile?: string | undefined;
        outDir?: string | undefined;
        preserveConstEnums?: boolean | undefined;
        pretty?: boolean | undefined;
        removeComments?: boolean | undefined;
        rootDir?: string | undefined;
        isolatedModules?: boolean | undefined;
        sourceMap?: boolean | undefined;
        sourceRoot?: string | undefined;
        suppressExcessPropertyErrors?: boolean | undefined;
        suppressImplicitAnyIndexErrors?: boolean | undefined;
        stripInternal?: boolean | undefined;
        target?: "es2015" | {
            [k: string]: any;
        } | "es3" | "es5" | "es2016" | "es2017" | "esnext" | undefined;
        watch?: boolean | undefined;
        experimentalDecorators?: boolean | undefined;
        emitDecoratorMetadata?: boolean | undefined;
        moduleResolution?: string | undefined;
        allowUnusedLabels?: boolean | undefined;
        noImplicitReturns?: boolean | undefined;
        noFallthroughCasesInSwitch?: boolean | undefined;
        allowUnreachableCode?: boolean | undefined;
        forceConsistentCasingInFileNames?: boolean | undefined;
        baseUrl?: string | undefined;
        paths?: {
            [k: string]: any;
        } | undefined;
        rootDirs?: string[] | undefined;
        typeRoots?: string[] | undefined;
        types?: string[] | undefined;
        traceResolution?: boolean | undefined;
        allowJs?: boolean | undefined;
        allowSyntheticDefaultImports?: boolean | undefined;
        noImplicitUseStrict?: boolean | undefined;
        listEmittedFiles?: boolean | undefined;
        lib?: ("es6" | "es2015" | "es5" | "es2016" | "es2017" | "esnext" | "es7" | "dom" | "dom.iterable" | "webworker" | "scripthost" | "es2015.core" | "es2015.collection" | "es2015.generator" | "es2015.iterable" | "es2015.promise" | "es2015.proxy" | "es2015.reflect" | "es2015.symbol" | "es2015.symbol.wellknown" | "es2016.array.include" | "es2017.object" | "es2017.sharedmemory" | "esnext.asynciterable")[] | undefined;
        strictNullChecks?: boolean | undefined;
        maxNodeModuleJsDepth?: number | undefined;
        importHelpers?: boolean | undefined;
        jsxFactory?: string | undefined;
        alwaysStrict?: boolean | undefined;
        strict?: boolean | undefined;
        downlevelIteration?: boolean | undefined;
        checkJs?: boolean | undefined;
    };
}
export declare class ProjectWithModule {
    project: Project;
    module: string;
    constructor(project: Project, module: string);
    readonly baselineDir: ReadableDir;
    readonly compilerOptions: CompilerOptionsConfig;
    readonly pluginConfig: TypeScriptConfig;
    readonly baseline: Baseline;
}
export declare class Baseline {
    config: BaselineConfig;
    errors: any;
    sourcemap: any;
    output: Tree;
    constructor(tree: Tree, basename: string);
}
export interface ProjectConfig {
    scenario: string;
    projectRoot: string;
    inputFiles: string[];
    resolveMapRoot?: boolean;
    resolveSourceRoot?: boolean;
    baselineCheck?: boolean;
    runTest?: boolean;
    bug?: string;
    [name: string]: any;
}
export interface BaselineConfig extends ProjectConfig {
    resolvedInputFiles: string[];
    emittedFiles: string[];
}
declare module "typescript" {
    const optionDeclarations: OptionDeclaration[];
    interface OptionDeclaration {
        name: string;
    }
}
