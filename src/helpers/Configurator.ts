import { Storage } from "webextension-polyfill-ts";
import { Configuration } from "../types/Configuration";
import { StorageError } from "../types/errors/StorageError";

export class Configurator {
  private defaultConfiguration: Configuration = {
    serverUrl: "",
    cacheDomainQualities: true,
  };

  private storageArea: Storage.StorageArea | undefined;
  private changeListeners: ((configuration: Configuration) => void)[] = [];

  constructor(private storage: Storage.Static) {
    this.storageArea = this.storage.local;
    this.storage.onChanged.addListener(this.notifyListeners.bind(this));
  }

  public async getConfiguration(): Promise<Configuration> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let storedData: { [s: string]: any } | undefined = undefined;
    try {
      storedData = await this.storageArea?.get(["configuration"]);
    } catch (error) {
      throw new StorageError();
    }

    if (!storedData?.configuration) {
      return this.defaultConfiguration;
    }

    return storedData["configuration"];
  }

  public async setConfiguration(configuration: Configuration): Promise<void> {
    try {
      await this.storageArea?.set({ configuration });
    } catch (error) {
      throw new StorageError();
    }
  }

  public addListener(listener: (configuration: Configuration) => void): void {
    this.changeListeners.push(listener);
  }

  public async notifyListeners(changes: {
    [s: string]: Storage.StorageChange;
  }): Promise<void> {
    if (changes.configuration) {
      const configuration = await this.getConfiguration();
      for (const listener of this.changeListeners) {
        listener(configuration);
      }
    }
  }
}
