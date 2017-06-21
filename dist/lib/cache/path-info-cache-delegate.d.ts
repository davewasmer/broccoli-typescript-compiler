import { CacheDelegate, Path, PathInfo } from "../interfaces";
export default class PathInfoCacheDelegate implements CacheDelegate<string, string, PathInfo> {
    private rootPath;
    private inputPath;
    constructor(rootPath: Path, inputPath: Path);
    cacheKey(key: string): string;
    create(key: string): PathInfo;
}
