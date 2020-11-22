import { Storage } from "webextension-polyfill-ts";
import Configuration from "../types/Configuration";
import StorageError from "../types/errors/StorageError";

export default class Configurator {
  private defaultConfiguration: Configuration = {
    serverUrl: "",
    cacheDomainQualities: true,
    cacheDomainQualitiesIncognito: false,
  };

  private storageArea: Storage.StorageArea | undefined;
  private changeListeners: ((configuration: Configuration) => void)[] = [];

  constructor(private storage: Storage.Static) {}

  init(): void {
    this.storageArea = this.storage.local;
    this.storage.onChanged.addListener(this.notifyListeners);
  }

  async getConfiguration(): Promise<Configuration> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let storedData: { [s: string]: any } | undefined = undefined;
    try {
      storedData = await await this.storageArea?.get(["configuration"]);
    } catch (error) {
      throw new StorageError();
    }

    if (!storedData?.configuration) {
      return this.defaultConfiguration;
    }

    return storedData["configuration"];
  }

  async setConfiguration(configuration: Configuration): Promise<void> {
    try {
      this.storageArea?.set({ configuration });
    } catch (error) {
      throw new StorageError();
    }
  }

  addListener(listener: (configuration: Configuration) => void): void {
    this.changeListeners.push(listener);
  }

  private async notifyListeners(changes: {
    [s: string]: Storage.StorageChange;
  }) {
    if (changes.configuration) {
      const configuration = await this.getConfiguration();
      for (const listener of this.changeListeners) {
        listener(configuration);
      }
    }
  }
}
