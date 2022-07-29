type Awaitable<T> = T | Promise<T>;

/**
 * https://nodejs.org/api/esm.html#loaders
 */
export type NextHook<Args extends [unknown, unknown], Result> = (
  ...args: Args
) => Result;

export type HookFunction<Args extends [unknown, unknown], Result> = (
  ...args: [...args: Args, nextHook: NextHook<Args, Result>]
) => Result;

export type ModuleFormat = LoadResult['format'];

type ExtendedModuleFormat = ModuleFormat | Omit<string, ''>;

export interface ResolveContext {
  conditions: string[];
  importAssertions: ImportAssertions;
  parentURL?: string;
}

export interface ResolveResult {
  format?: ExtendedModuleFormat | null;
  shortCircuit: true;
  url: string;
}

export type ResolveHook = HookFunction<
  [specifier: string, context: ResolveContext],
  Awaitable<ResolveResult>
>;

export interface LoadContext {
  format?: ExtendedModuleFormat | null;
  importAssertions: ImportAssertions;
}

export type LoadResult = { shortCircuit: true } & (
  | {
      format: 'builtin';
    }
  | { format: 'commonjs' }
  | {
      format: 'json';
      source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array;
    }
  | {
      format: 'module';
      source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array;
    }
  | {
      format: 'wasm';
      source: ArrayBuffer | SharedArrayBuffer | Uint8Array;
    }
);

export type LoadHook = HookFunction<
  [url: string, context: LoadContext],
  Awaitable<LoadResult>
>;

export type HookMap = {
  load: LoadHook;
  resolve: ResolveHook;
};

export interface NodeLoaderConfigInput {
  loaders: HookMap[];
}

export interface ResolvedLoaders {
  load: LoadHook;
  resolve: ResolveHook;
}

export interface NodeLoaderConfig {
  loaders: HookMap[];
  resolvedLoaders: ResolvedLoaders;
}

export interface NodeLoader {
  setConfigPromise: (
    config: Promise<NodeLoaderConfigInput>,
  ) => Promise<NodeLoaderConfig>;
}
