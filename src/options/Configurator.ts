import { Storage } from "webextension-polyfill-ts";
import Configuration from "../types/Configuration";
import StorageError from "../types/errors/StorageError";

export default class Configurator {
  private storageArea: Storage.StorageArea;
  private defaultConfiguration: Configuration = {
    serverUrl: "http://localhost:3000/",
  };

  constructor(private storage: Storage.Static) {
    this.storageArea = storage.local;
  }

  async init(): Promise<void> {
    const syncData = await this.storage.sync.get(["configuration"]);
    if (syncData.length !== 0) {
      this.storageArea = this.storage.sync;
    }
  }

  async getConfiguration(): Promise<Configuration> {
    const storedData = await this.storageArea.get(["configuration"]);

    if (storedData === undefined) {
      throw new StorageError("Storage operation failed.");
    }

    if (storedData.length === 0) {
      return this.defaultConfiguration;
    }

    return storedData["configuration"];
  }

  setConfiguration(configuration: Configuration): void {
    try {
      this.storageArea.set({ configuration });
    } catch (error) {
      const typedError = error as Error;
      throw new StorageError(typedError.message, typedError.stack);
    }
  }
}
