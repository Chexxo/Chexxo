import { Storage } from "webextension-polyfill-ts";

import { Quality } from "../../../types/Quality";

export class QualityProvider {
  constructor(private storageArea: Storage.StorageArea) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  createQualityEntry(url: string, quality: Quality): void {}

  async hasQualityDecreased(url: string, quality: Quality): Promise<boolean> {
    const storedQuality = await this.getQuality(url);
    return storedQuality.level > quality.level;
  }

  private async getQuality(url: string): Promise<Quality> {
    const storageData = await this.storageArea.get(["qualities"]);
    if (storageData.qualities) {
      return storageData.qualities[url] as Quality;
    } else {
      return Quality.Unknown;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  private setQuality(url: string, quality: Quality): void {}
}
