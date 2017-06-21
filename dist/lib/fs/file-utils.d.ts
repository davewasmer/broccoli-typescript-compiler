/// <reference types="node" />
import { Stats } from "fs";
import { DirEntries, FileContent, Path, PathResolver, Resolution } from "../interfaces";
export declare function readFile(path: Path): FileContent;
export declare function readFileResolution(resolution: Resolution): FileContent | undefined;
export declare function stat(path: Path): Stats | undefined;
export declare function readdir(path: Path, resolver: PathResolver): DirEntries;
