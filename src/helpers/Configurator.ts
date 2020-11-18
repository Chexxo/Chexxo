import { browser, Storage } from "webextension-polyfill-ts";
import Configuration from "../types/Configuration";
import StorageError from "../types/errors/StorageError";

export default class Configurator {
  private defaultConfiguration: Configuration = {
    serverUrl: "http://localhost:3000/",
    cacheDomainQualities: true,
    cacheDomainQualitiesIncognito: false,
  };

  private storageArea: Storage.StorageArea | undefined;
  private changeListeners: ((configuration: Configuration) => void)[] = [];

  constructor(private storage: Storage.Static) {}

  async init(): Promise<void> {
    this.storageArea = this.storage.local;

    browser.storage.onChanged.addListener(
      async (changes: { [s: string]: Storage.StorageChange }) => {
        if (changes["configuration"]) {
          const configuration = await this.getConfiguration();
          for (const listener of this.changeListeners) {
            listener(configuration);
          }
        }
      }
    );
  }

  async getConfiguration(): Promise<Configuration> {
    const storedData = await this.storageArea?.get(["configuration"]);

    if (storedData === undefined) {
      throw new StorageError("Storage operation failed.");
    }

    if (Object.keys(storedData).length === 0) {
      return this.defaultConfiguration;
    }

    return storedData["configuration"];
  }

  setConfiguration(configuration: Configuration): void {
    try {
      this.storageArea?.set({ configuration });
    } catch (error) {
      const typedError = error as Error;
      throw new StorageError(typedError.message, typedError.stack);
    }
  }

  addListener(listener: (configuration: Configuration) => void): void {
    this.changeListeners.push(listener);
  }

  removeListener(listener: (configuration: Configuration) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index !== -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  hasListener(listener: (configuration: Configuration) => void): boolean {
    const index = this.changeListeners.indexOf(listener);
    return index !== -1;
  }
}
