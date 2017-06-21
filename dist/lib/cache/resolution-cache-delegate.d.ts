import { CacheDelegate, Path, PathInfo, Resolution } from "../interfaces";
export default class ResolutionCacheDelegate implements CacheDelegate<PathInfo, Path, Resolution> {
    cacheKey(pathInfo: PathInfo): Path;
    create(pathInfo: PathInfo): Resolution;
}
