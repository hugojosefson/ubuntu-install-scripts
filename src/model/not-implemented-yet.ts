export const notImplementedYet = (method: string) =>
  () =>
    Promise.reject(new Error(`${this.type}.${method} not implemented yet.`));
