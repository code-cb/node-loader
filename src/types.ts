/**
 * https://nodejs.org/api/esm.html#loaders
 */
export type HookFunction<TArgs extends [unknown, unknown], TReturn> = (
  ...args: [...args: TArgs, defaultImpl: HookFunction<TArgs, TReturn>]
) => TReturn;

export type ModuleFormat = 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm';

type ExtendedModuleFormat = ModuleFormat | Omit<string, ''>;

type ImportAssertions = object;

export interface ResolveContext {
  conditions: string[];
  importAssertions: ImportAssertions;
  parentURL?: string;
}

export interface ResolveResult {
  format?: ExtendedModuleFormat | null;
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

export interface LoadResult {
  format: ModuleFormat;
  source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array;
}

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
