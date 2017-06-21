import Cache from "../cache";
import { DirEntries, Path, PathResolver } from "../interfaces";
export default class DirEntriesCache extends Cache<Path, Path, DirEntries> {
    constructor(resolver: PathResolver);
}
