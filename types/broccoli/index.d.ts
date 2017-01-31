declare module "broccoli" {
  export interface ThenCallback {
    (value: any | undefined | null): any | undefined | null | void;
  }

  export interface PromiseLike {
    then(onfulfilled: ThenCallback, onrejected?: ThenCallback): PromiseLike;
    finally(oncompleted: ThenCallback): PromiseLike;
  }

  export class Builder {
    outputPath: string;
    constructor(outputNode: any);
    cleanup(): void;
    build(): PromiseLike;
  }
}
