import { isAbsolute, resolve as pathResolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { processConfig } from './processConfig.js';
import type {
  LoadHook,
  NodeLoader,
  NodeLoaderConfig,
  ResolveHook,
} from './types.js';

export type {} from './global.js';
export type {
  HookFunction,
  LoadContext,
  LoadHook,
  LoadResult,
  ModuleFormat,
  NodeLoader,
  NodeLoaderConfig,
  NodeLoaderConfigInput,
  ResolveContext,
  ResolveHook,
  ResolveResult,
} from './types.js';

const { NODE_LOADER_CONFIG } = process.env;
const configPath = pathToFileURL(
  NODE_LOADER_CONFIG && isAbsolute(NODE_LOADER_CONFIG)
    ? NODE_LOADER_CONFIG
    : pathResolve(process.cwd(), NODE_LOADER_CONFIG || 'node-loader.config.js'),
);
let config: NodeLoaderConfig;
let loadingConfig = false;

const getConfig = async () => {
  if (!config) {
    try {
      loadingConfig = true;
      const mod = await import(configPath.href);
      config = processConfig(mod.default);
    } catch (err) {
      console.warn(
        `Could not read node-loader.config.js file at ${configPath}, continuing without node loader config`,
      );
      console.error(err);
      config = processConfig({ loaders: [] });
    }
  }
  loadingConfig = false;
  return config;
};

export const load: LoadHook = async (url, context, nextLoad) => {
  if (loadingConfig) return nextLoad(url, context);
  const { resolvedLoaders } = await getConfig();
  return resolvedLoaders.load(url, context, nextLoad);
};

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  if (loadingConfig) return nextResolve(specifier, context);
  const { resolvedLoaders } = await getConfig();
  return resolvedLoaders.resolve(specifier, context, nextResolve);
};

global.nodeLoader ||= {} as NodeLoader;
global.nodeLoader.setConfigPromise = newConfig => newConfig.then(processConfig);
