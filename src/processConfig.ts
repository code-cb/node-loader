import type {
  HookMap,
  HookFunction,
  ResolvedLoaders,
  NodeLoaderConfigInput,
  NodeLoaderConfig,
  NextHook,
} from './types.js';

const die = (msg: string, err?: Error): never => {
  const fullMsg = `node-loader.config.js: ${msg}`;
  console.error(fullMsg);
  err && console.error(err);
  process.exit(1);
};

const getHooks = <HookName extends keyof HookMap>(
  loaders: HookMap[],
  name: HookName,
) => loaders.flatMap(loader => loader[name] ?? []);

const constructImpl =
  <Arg1, Arg2, Result>(
    hooks: HookFunction<[Arg1, Arg2], Result>[],
    index: number,
    defaultHook: HookFunction<[Arg1, Arg2], Result>,
  ): NextHook<[Arg1, Arg2], Result> =>
  (arg1, arg2) => {
    const impl = hooks[index] || defaultHook;
    const nextHook = constructImpl(hooks, index + 1, defaultHook);
    return impl(arg1, arg2, nextHook);
  };

const flattenHooks =
  <Arg1, Arg2, Result>(
    hooks: HookFunction<[Arg1, Arg2], Result>[],
  ): HookFunction<[Arg1, Arg2], Result> =>
  (arg1, arg2, defaultHook) => {
    const impl = constructImpl(hooks, 0, defaultHook);
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
    return die('did not export a config object as default export.');

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
