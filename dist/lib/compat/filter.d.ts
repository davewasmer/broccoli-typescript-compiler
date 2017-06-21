import { TypeScriptPluginOptions } from "../plugin";
/**
 * Backwards compat filter behavior.
 *
 * Preserves the filter aspect of compiling only .ts
 * and passing through all other files.
 */
export default function filterLike(inputNode: any, options?: TypeScriptPluginOptions): any;
