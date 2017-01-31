declare module "fixturify" {
  export interface Dir {
    [fileName: string]: Dir | string | null | undefined;
  }
  export function readSync(dir: string): Dir;
  export function writeSync(dir: string, obj: Dir);
}
