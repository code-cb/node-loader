import { isAbsolute, resolve as pathResolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { processConfig } from './processConfig';
import { LoadHook, NodeLoader, NodeLoaderConfig, ResolveHook } from './types';

export * from './global';
export type {
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
} from './types';

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

export const load: LoadHook = async (url, context, defaultLoad) => {
  if (loadingConfig) return defaultLoad(url, context, defaultLoad);
  const { resolvedLoaders } = await getConfig();
  return resolvedLoaders.load(url, context, defaultLoad);
};

export const resolve: ResolveHook = async (
  specifier,
  context,
  defaultResolve,
) => {
  if (loadingConfig) return defaultResolve(specifier, context, defaultResolve);
  const { resolvedLoaders } = await getConfig();
  return resolvedLoaders.resolve(specifier, context, defaultResolve);
};

global.nodeLoader ||= {} as NodeLoader;
global.nodeLoader.setConfigPromise = newConfig => newConfig.then(processConfig);
