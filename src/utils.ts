export const configErrorMessage = (msg: string) =>
  `node-loader.config.js: ${msg}`;

export const die = (msg: string, err?: Error): never => {
  console.error(msg);
  err && console.error(err);
  process.exit(1);
};
