import { Logger } from "../../shared/logger/Logger";
import { LogEntry } from "../../shared/types/logger/LogEntry";
import { InBrowserPersistenceManager } from "./InBrowserPersistenceManager";

/**
 * Class for logging messages.
 */
export class InBrowserLogger extends Logger {
  constructor(protected persistence: InBrowserPersistenceManager) {
    super(persistence);
  }

  /**
   * Gets all persistet log entries and
   * returns them.
   *
   * @returns all log entries persistet up
   * until invokation.
   */
  public async getAll(): Promise<LogEntry[] | null> {
    return this.persistence.getAll();
  }

  /**
   * Removes all log entries from the
   * browsers storage.
   */
  public async removeAll(): Promise<void> {
    return this.persistence.removeAll();
  }
}
