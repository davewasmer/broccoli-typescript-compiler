import Cache from "../cache";
import { Path, PathInfo } from "../interfaces";
export default class PathInfoCache extends Cache<string, string, PathInfo> {
    constructor(rootPath: Path, inputPath: Path);
}
