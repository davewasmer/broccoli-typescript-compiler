import { createReadableDir, ReadableDir, Tree } from "broccoli-test-helper";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import {
  CompilerOptionsConfig,
  normalizePath,
  TypeScriptConfig,
} from "../lib/index";

export interface ProjectRunnerConfig {
  typescriptDir: string;
}

// tslint:disable:max-classes-per-file
export default class ProjectRunner {
  public rootDir: string;
  public projectJsonDir: string;
  constructor(config: ProjectRunnerConfig) {
    const rootDir = path.resolve(config.typescriptDir);
    this.rootDir = rootDir;
    this.projectJsonDir = path.join(rootDir, "tests/cases/project");
  }

  public each(callback: (project: Project) => void) {
    const { rootDir, projectJsonDir } = this;
    const entries = fs.readdirSync(projectJsonDir);
    for (const entry of entries) {
      const extname = path.extname(entry);
      if (extname === ".json") {
        const configPath = path.join(projectJsonDir, entry);
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        const basename = path.basename(entry, extname);
        if (this.shouldSkip(basename, config)) {
          continue;
        }
        callback(new Project(rootDir, basename, config));
      }
    }
  }

  public shouldSkip(basename: string, config: ProjectConfig) {
    return basename === "invalidRootFile" ||
       /^mapRootRelativePath/.test(basename) ||
       /^sourceRootRelativePath/.test(basename) ||
       (/^maprootUrl/.test(basename) && !/^maprootUrlsourcerootUrl/.test(basename)) ||
       /^maprootUrlSubfolder/.test(basename) ||
       /^referenceResolutionRelativePaths/.test(basename) ||
        basename === "rootDirectory" ||
        basename === "rootDirectoryWithSourceRoot" ||
        !config.baselineCheck ||
        config.resolveMapRoot ||
        config.resolveSourceRoot;
  }
}

export class Project {
  public baselineDir: string;
  constructor(
    public rootDir: string,
    public basename: string,
    public config: ProjectConfig) {
  }

  public each(callback: (project: ProjectWithModule) => void) {
    callback(new ProjectWithModule(this, "amd"));
    callback(new ProjectWithModule(this, "commonjs"));
  }

  get dir() {
    return path.join(this.rootDir, this.config.projectRoot);
  }

  get tsconfigFile(): string | undefined {
    if (this.config.project) {
      return path.join(this.config.project, "tsconfig.json");
    }
  }

  get inputFiles(): string[] | undefined {
    return this.config.inputFiles;
  }

  get compilerOptions() {
    const { config } = this;
    const compilerOptions: CompilerOptionsConfig = {};
    ts.optionDeclarations.forEach((opt) => {
      const name = opt.name;
      if (name in config) {
        compilerOptions[name] = config[name];
      }
    });
    return compilerOptions;
  }
}

export class ProjectWithModule {
  constructor(
    public project: Project,
    public module: string,
  ) {}

  get baselineDir(): ReadableDir {
    return createReadableDir(path.join(
      this.project.rootDir,
      "tests/baselines/reference/project",
      this.project.basename,
      this.module === "amd" ? "amd" : "node"));
  }

  get compilerOptions(): CompilerOptionsConfig {
    return Object.assign(this.project.compilerOptions, {
      module: this.module,
      moduleResolution: "classic",
      newLine: "CRLF",
      typeRoots: [],
    });
  }

  get pluginConfig(): TypeScriptConfig {
    const { project } = this;
    const inputFiles = project.inputFiles;
    const tsconfigFile = project.tsconfigFile;
    const config: TypeScriptConfig = {
      compilerOptions: this.compilerOptions,
      rootPath: this.project.dir,
    };

    if (tsconfigFile) {
      config.tsconfig = tsconfigFile;
    } else if (inputFiles) {
      config.tsconfig = { files: inputFiles };
    }

    return config;
  }

  get baseline() {
    return new Baseline(this.baselineDir.read(), this.project.basename);
  }
}

export class Baseline {
  public config: BaselineConfig;
  public errors: any;
  public sourcemap: any;
  public output: Tree;
  constructor(tree: Tree, basename: string) {
    const configName = basename + ".json";
    const errorsName = basename + ".errors.txt";
    const sourcemapName = basename + "sourcemap.txt";
    const config: BaselineConfig = JSON.parse(tree[configName] as string);
    this.config = config;
    this.errors = tree[errorsName];
    this.sourcemap = tree[errorsName];
    delete tree[configName];
    delete tree[errorsName];
    delete tree[sourcemapName];
    this.output = cleanExpectedTree(tree, config.emittedFiles);
  }
}

function normalizeTree(baseline: Tree) {
  const normalized: Tree = {};
  const files = Object.keys(baseline);
  for (const file of files) {
    let value = baseline[file];
    if (typeof value === "object" && value !== null) {
      value = normalizeTree(value);
    } else if (typeof value === "string" && path.extname(file) === ".map") {
      const sourceMapData = JSON.parse(value);
      for (let i = 0; i < sourceMapData.sources.length; i++) {
        sourceMapData.sources[i] = normalizePath(sourceMapData.sources[i]);
      }
      value = JSON.stringify(sourceMapData);
    }
    normalized[normalizePath(file)] = value;
  }
  return normalized;
}

function cleanExpectedTree(baseline: Tree, emittedFiles?: string[]) {
  const clean: Tree = {};
  if (emittedFiles) {
    const normalized = normalizeTree(baseline);
    for (const emittedFile of emittedFiles) {
      const parts = normalizePath(emittedFile).split("/");
      let src: Tree | string | null | undefined = normalized;
      let target: Tree | string | null | undefined = clean;
      for (const part of parts) {
        if (typeof target !== "object" ||
            target === null ||
            typeof src !== "object" ||
            src === null) {
          continue;
        }
        if (part === "..") {
          // we can let you escape the outputPath
          // TODO, maybe support compilerOptions.project as a way to make this pass
          // tslint:disable:no-console
          console.warn(emittedFile);
          break;
        }
        target[part] = src[part];
        src = src[part];
        target = target[part];
      }
    }
  }
  return clean;
}

export interface ProjectConfig {
  scenario: string;
  // project where it lives - this also is the current directory when compiling
  projectRoot: string;
  // list of input files to be given to program
  inputFiles: string[];
  // should we resolve this map root and give compiler the absolute disk path as map root?
  resolveMapRoot?: boolean;
  // should we resolve this source root and give compiler the absolute disk path as map root?
  resolveSourceRoot?: boolean;
  // Verify the baselines of output files, if this is false, we will write to output to the disk
  // but there is no verification of baselines
  baselineCheck?: boolean;
  // Run the resulting test
  runTest?: boolean;
  // If there is any bug associated with this test case
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
