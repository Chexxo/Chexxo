import { Storage } from "webextension-polyfill-ts";

import { Quality } from "../../../types/Quality";
import { StorageError } from "../../../types/errors/StorageError";

/**
 * Class which is responsible for managing the qualities of
 * domains which the user already visited. This information
 * is then used to block domains should their quality have
 * decreased since the last visit.
 */
export class QualityProvider {
  /**
   * Represents the current configuration option regarding
   * domain caching. If `true` domain qualities are
   * cached.
   */
  private isCacheActive = true;

  /**
   * Responsible for constructing the class.
   *
   * @param storageArea The storage area where the cached
   * domains will be persisted.
   */
  constructor(private storageArea: Storage.StorageArea) {}

  /**
   * Updates the class internal configuration with the
   * given configration.
   *
   * @param isCacheActive The current state of the domain
   * caching configuration option within the extension.
   */
  public updateIsCacheActive(isCacheActive: boolean): void {
    this.isCacheActive = isCacheActive;
  }

  /**
   * Verifies if the quality of the domain given has
   * decreased since the last visit. If caching is disabled
   * in the extension options or the domain has not been
   * visited before, the function returns `false`.
   *
   * @param url The url of the domain to be checked.
   * @param quality The new quality measured for the domain.
   */
  public async hasQualityDecreased(
    url: string,
    quality: Quality
  ): Promise<boolean> {
    if (this.isCacheActive) {
      const storedQuality = await this.getQuality(url);
      return storedQuality.level > quality.level;
    } else {
      return false;
    }
  }

  /**
   * Sets the provided quality for the provided url
   * inside the domain cache.
   *
   * @param url The url to be used as key.
   * @param quality The quality to be set as value.
   */
  public async defineQuality(url: string, quality: Quality): Promise<void> {
    if (this.isCacheActive) {
      await this.setQuality(url, quality);
    }
  }

  /**
   * Resets the quality of the given url to unknown.
   *
   * @param url The url to be reset inside the cache.
   */
  public async resetQuality(url: string): Promise<void> {
    if (this.isCacheActive) {
      await this.setQuality(url, Quality.Unknown);
    }
  }

  /**
   * Removes the entire domain cache from the
   * browsers storage.
   */
  public async removeQualities(): Promise<void> {
    return this.storageArea.remove(["qualities"]);
  }

  /**
   * Gets the quality of the url provided from
   * the domain cache.
   *
   * @param url Url of which the cached quality
   * shall be retrieved.
   */
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

  /**
   * Sets the provided quality for the provided url
   * inside the domain cache.
   *
   * @param url The url to be used as key.
   * @param quality The quality to be set as value.
   */
  private async setQuality(url: string, quality: Quality): Promise<void> {
    try {
      const storageData = await this.storageArea.get(["qualities"]);
      const qualities: Record<string, Quality> = storageData.qualities || {};
      qualities[this.stripUrl(url)] = quality;
      await this.storageArea.set({ qualities });
    } catch (error) {
      throw new StorageError();
    }
  }

  /**
   * Strips the given url from all elements except the host.
   *
   * @param url The url to be stripped.
   *
   * @returns The host part of the url.
   */
  private stripUrl(url: string): string {
    const validUrl = new URL(url);
    return validUrl.host;
  }
}
