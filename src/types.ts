/**
 * https://nodejs.org/api/esm.html#loaders
 */
export type HookFunction<TArgs extends [unknown, unknown], TReturn> = (
  ...args: [...args: TArgs, nextHook: HookFunction<TArgs, TReturn>]
) => TReturn;

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
  ResolveResult | Promise<ResolveResult>
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
  LoadResult | Promise<LoadResult>
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
