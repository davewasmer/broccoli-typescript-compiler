import { ParsedCommandLine } from "typescript";
import { CompilerOptionsConfig, Path } from "../interfaces";
import Input from "./input-io";
export default class ConfigParser {
    private rootPath;
    private rawConfig;
    private configFileName;
    private compilerOptions;
    private host;
    constructor(rootPath: Path, rawConfig: CompilerOptionsConfig | undefined, configFileName: string | undefined, compilerOptions: CompilerOptionsConfig | undefined, input: Input);
    parseConfig(): ParsedCommandLine;
    private resolveConfigFileName();
}
