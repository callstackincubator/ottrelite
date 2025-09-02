export interface NitroOttreliteConsumerLib {
  /**
   * Generates an RGBA image of the specified dimensions.
   * @param width The width of the image to generate.
   * @param height The height of the image to generate.
   *
   * @returns A promise that resolves to a 1D array of [0-255] RGBA values.
   */
  generateImage(width: number, height: number): number[];
}
