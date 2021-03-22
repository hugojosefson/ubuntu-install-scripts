export const ensureOk = (): Promise<void> => Promise.resolve();
export const ensureAllOk = (promises: Array<Promise<any>>) =>
  Promise.all(promises).then(ensureOk);
