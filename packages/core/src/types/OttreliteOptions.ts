export type OttreliteOptions = Partial<{
  /**
   * If set to `true`, the `Systrace` RN API, which is no-op by default, will be replaced
   * and will call the `Ottrelite` API methods under the hood.
   *
   * @see https://reactnative.dev/docs/systrace
   */
  reviveSystraceAPI: boolean;
}>;
