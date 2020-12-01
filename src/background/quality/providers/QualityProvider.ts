import { Storage } from "webextension-polyfill-ts";

import { Quality } from "../../../types/Quality";
import { StorageError } from "../../../types/errors/StorageError";

export class QualityProvider {
  constructor(private storageArea: Storage.StorageArea) {}

  async setQuality(url: string, quality: Quality): Promise<void> {
    try {
      const storageData = await this.storageArea.get(["qualities"]);
      const qualities: Record<string, Quality> = storageData.qualities || {};
      qualities[this.stripUrl(url)] = quality;
      await this.storageArea.set({ qualities });
    } catch (error) {
      throw new StorageError();
    }
  }

  async hasQualityDecreased(url: string, quality: Quality): Promise<boolean> {
    const storedQuality = await this.getQuality(url);
    return storedQuality.level > quality.level;
  }

  async resetQuality(url: string): Promise<void> {
    await this.setQuality(url, Quality.Unknown);
  }

  private async getQuality(url: string): Promise<Quality> {
    try {
      const storageData = await this.storageArea.get(["qualities"]);
      const host = this.stripUrl(url);

      if (storageData.qualities && storageData.qualities[host]) {
        return storageData.qualities[host] as Quality;
      } else {
        return Quality.Unknown;
      }
    } catch (error) {
      throw new StorageError();
    }
  }

  private stripUrl(url: string): string {
    const validUrl = new URL(url);
    return validUrl.host;
  }
}
