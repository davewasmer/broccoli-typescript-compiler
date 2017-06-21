import { ParseConfigHost } from "typescript";
import { Path } from "../interfaces";
import InputIO from "./input-io";
export default function createParseConfigHost(rootPath: Path, input: InputIO): ParseConfigHost;
declare module "typescript" {
    interface FileSystemEntries {
        files: string[];
        directories: string[];
    }
    function matchFiles(path: string, extensions: string[], excludes: string[], includes: string[], useCaseSensitiveFileNames: boolean, currentDirectory: string, getFileSystemEntries: (path: string) => FileSystemEntries): string[];
}
