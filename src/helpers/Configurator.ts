import { Storage } from "webextension-polyfill-ts";
import { Configuration } from "../types/Configuration";
import { StorageError } from "../types/errors/StorageError";

/**
 * Class which is responsible for all functionality regarding the
 * extensions configuration.
 */
export class Configurator {
  /**
   * Represents the deefault configuration which will be set if no other
   * configuration has been defined by the user.
   */
  private defaultConfiguration: Configuration = {
    serverUrl: "",
    cacheDomainQualities: true,
  };

  /**
   * The storage area where the configuration will be persisted.
   */
  private storageArea: Storage.StorageArea | undefined;

  /**
   * The list of listener which will be called as soon as the configuration
   * changes.
   */
  private changeListeners: ((configuration: Configuration) => void)[] = [];

  constructor(private storage: Storage.Static) {
    this.storageArea = this.storage.local;
    this.storage.onChanged.addListener(this.notifyListeners.bind(this));
  }

  /**
   * Gets the curret extension configuration from the browser storage.
   */
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

  /**
   * Persists the given configuration within the browser storage.
   *
   * @param configuration Configuration to be persited.
   */
  public async setConfiguration(configuration: Configuration): Promise<void> {
    try {
      await this.storageArea?.set({ configuration });
    } catch (error) {
      throw new StorageError();
    }
  }

  /**
   * Adds a listener which will be notified as soon as the configuration changes.
   */
  public addListener(listener: (configuration: Configuration) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Will be called by the browser api as soon as the configuration of
   * the extension has been changed. This function will then relay the
   * new configuration to all registered listeners.
   *
   * @param changes The changes that have been made to the configuration.
   */
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
