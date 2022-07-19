import type {
  HookMap,
  HookFunction,
  ResolvedLoaders,
  NodeLoaderConfigInput,
  NodeLoaderConfig,
} from './types.js';
import { die, configErrorMessage } from './utils.js';

const getHooks = <THookName extends keyof HookMap>(
  loaders: HookMap[],
  name: THookName,
) => loaders.flatMap(loader => loader[name] ?? []);

const constructImpl =
  <TArg1, TArg2, TReturn>(
    hooks: HookFunction<[TArg1, TArg2], TReturn>[],
    index: number,
    nextHook: HookFunction<[TArg1, TArg2], TReturn>,
  ) =>
  (arg1: TArg1, arg2: TArg2) => {
    const impl = hooks[index] || nextHook;
    const nextImpl = constructImpl(hooks, index + 1, nextHook);
    return impl(arg1, arg2, nextImpl);
  };

const flattenHooks =
  <TArg1, TArg2, TReturn>(
    hooks: HookFunction<[TArg1, TArg2], TReturn>[],
  ): HookFunction<[TArg1, TArg2], TReturn> =>
  (arg1, arg2, nextHook) => {
    const impl = constructImpl(hooks, 0, nextHook);
    return impl(arg1, arg2);
  };

const resolveLoaders = (loaders: HookMap[]): ResolvedLoaders => ({
  load: flattenHooks(getHooks(loaders, 'load')),
  resolve: flattenHooks(getHooks(loaders, 'resolve')),
});

export const processConfig = (
  config: NodeLoaderConfigInput | undefined,
): NodeLoaderConfig => {
  if (!config || typeof config !== 'object')
    return die(
      configErrorMessage('did not export a config object as default export.'),
    );

  if (!Array.isArray(config.loaders))
    return die('exported object does not include a "loaders" array.');

  config.loaders.forEach((loader, i) => {
    if (typeof loader !== 'object')
      die(
        `invalid loader at index ${i} - expected object but received ${typeof loader}`,
      );

    if (Array.isArray(loader))
      die(
        `invalid loader at index ${i} - expected plain object but received array`,
      );
  });

  return {
    loaders: config.loaders,
    resolvedLoaders: resolveLoaders(config.loaders),
  };
};
