import { Logger } from "../../shared/logger/Logger";
import { LogEntry } from "../../shared/types/logger/LogEntry";
import { InBrowserPersistenceManager } from "./InBrowserPersistenceManager";

export class InBrowserLogger extends Logger {
  constructor(persistence: InBrowserPersistenceManager) {
    super(persistence);
  }

  public async getAll(): Promise<LogEntry[] | null> {
    const castPersistence = <InBrowserPersistenceManager>this.persistence;
    return castPersistence.getAll();
  }

  public async removeAll(): Promise<void> {
    const castPersistence = <InBrowserPersistenceManager>this.persistence;
    return castPersistence.removeAll();
  }
}
