import { UUIDFactory } from "../../helpers/UUIDFactory";
import { LogFactory } from "../../shared/logger/LogFactory";
import { LogLevel } from "../../shared/logger/Logger";
import { LoggerPersistenceManager } from "../../shared/logger/LoggerPersistenceManager";
import { LogEntry } from "../../shared/types/logger/LogEntry";
import { Storage } from "webextension-polyfill-ts";

export class InBrowserPersistenceManager implements LoggerPersistenceManager {
  private static millisecondsADay = 86_400_000;
  private static logDays = 14;

  /**
   * Constructs the persistence manager with the storage given.
   *
   * @param storageArea The storage area which will be used to persist the log.
   */
  constructor(private storageArea: Storage.StorageArea) {}

  /**
   * Persists the given {@link LogEntry}. Dependent on the {@link LogLevel}
   * the log will be written to the console and the browser storage or just
   * to the console.
   *
   * @param logEntry The log entry to be persisted.
   */
  public async save(logEntry: LogEntry): Promise<void> {
    let uuid = undefined;
    if (logEntry.error) {
      uuid = logEntry.error.uuid;
    } else if (logEntry.logLevel < LogLevel.INFO) {
      uuid = UUIDFactory.uuidv4();
    }

    let logFunction = null;
    switch (logEntry.logLevel) {
      case LogLevel.WARNING:
        logFunction = console.warn;
        break;
      case LogLevel.INFO:
        logFunction = console.log;
        break;
      default:
        logFunction = console.error;
    }

    const logEntryReadable = LogFactory.formatLogEntry(logEntry, uuid);
    logFunction(logEntryReadable);

    if (logEntry.logLevel < LogLevel.INFO) {
      await this.writeLog(logEntry);
    }
  }

  /**
   * Returns all log entries currently saved inside the
   * browser.
   */
  public async getAll(): Promise<LogEntry[] | null> {
    const storageResponse = await this.storageArea.get(["log"]);
    if (storageResponse.log) {
      return storageResponse.log;
    }
    return null;
  }

  /**
   * Writes a {@link LogEntry} to the storage
   * @param logEntry The log entry to be written.
   */
  private async writeLog(logEntry: LogEntry) {
    const storageResponse = await this.storageArea.get(["log"]);
    let logEntries: LogEntry[] = [];
    if (storageResponse.log !== undefined) {
      logEntries = <LogEntry[]>storageResponse.log;
      logEntries = this.logRotate(logEntries);
    } else {
      await this.save(
        new LogEntry(LogLevel.INFO, Date.now(), "No log found. Creating new...")
      );
    }
    logEntries.push(logEntry);
    await this.storageArea.set({ log: logEntries });
  }

  /**
   * Removes expired log entries.
   * @param logEntries Array of log entries sorted in
   * ascending order by timestamp.
   */
  private logRotate(logEntries: LogEntry[]): LogEntry[] {
    const deadline =
      Date.now() -
      InBrowserPersistenceManager.logDays *
        InBrowserPersistenceManager.millisecondsADay;
    for (let i = 0, len = logEntries.length; i < len; i++) {
      if (deadline < logEntries[i].millisecTimestamp) {
        if (i === 0) {
          return logEntries;
        }
        return logEntries.slice(i, logEntries.length);
      }
    }
    return [];
  }
}
