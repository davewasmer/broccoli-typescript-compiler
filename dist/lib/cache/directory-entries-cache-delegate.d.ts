import { CacheDelegate, DirEntries, Path, PathResolver } from "../interfaces";
export default class DirEntriesCacheDelegate implements CacheDelegate<Path, Path, DirEntries> {
    private resolver;
    constructor(resolver: PathResolver);
    cacheKey(path: Path): Path;
    create(path: Path): DirEntries;
}
