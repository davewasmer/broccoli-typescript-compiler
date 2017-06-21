import { Path, PathResolver, Resolution } from "../interfaces";
export default class PathResolverImpl implements PathResolver {
    private pathInfoCache;
    private resolutionCache;
    constructor(rootPath: Path, inputPath: Path);
    resolve(path: string): Resolution;
    reset(): void;
}
