import { CompilerHost, CompilerOptions } from "typescript";
import { Path } from "../interfaces";
import InputIO from "./input-io";
import SourceCache from "./source-cache";
export default function createCompilerHost(rootPath: Path, input: InputIO, sourceCache: SourceCache, compilerOptions: CompilerOptions): CompilerHost;
