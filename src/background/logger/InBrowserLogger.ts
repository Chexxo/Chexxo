import { Logger } from "../../shared/logger/Logger";
import { LogEntry } from "../../shared/types/logger/LogEntry";
import { InBrowserPersistenceManager } from "./InBrowserPersistenceManager";

export class InBrowserLogger extends Logger {
  constructor(protected persistence: InBrowserPersistenceManager) {
    super(persistence);
  }

  public async getAll(): Promise<LogEntry[] | null> {
    return this.persistence.getAll();
  }

  public async removeAll(): Promise<void> {
    return this.persistence.removeAll();
  }
}
