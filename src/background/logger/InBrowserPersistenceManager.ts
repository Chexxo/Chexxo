import { LogFactory } from "../../shared/logger/LogFactory";
import { LogLevel } from "../../shared/logger/Logger";
import { LoggerPersistenceManager } from "../../shared/logger/LoggerPersistenceManager";
import { LogEntry } from "../../shared/types/logger/LogEntry";
import { Storage } from "webextension-polyfill-ts";
import { StorageError } from "../../types/errors/StorageError";

/**
 * Class to persist log entries within the browsers storage.
 */
export class InBrowserPersistenceManager implements LoggerPersistenceManager {
  private static millisecondsADay = 86_400_000;
  private static logDays = 2;

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

    const logEntryReadable = LogFactory.formatLogEntry(logEntry);
    logFunction(logEntryReadable);

    if (logEntry.logLevel < LogLevel.INFO) {
      await this.writeLog(logEntry);
    }
  }

  /**
   * Gets all persisted log entries and returns them.
   *
   * @returns all log entries persisted up until invocation.
   */
  public async getAll(): Promise<LogEntry[] | null> {
    try {
      const storageResponse = await this.storageArea.get(["log"]);
      if (storageResponse.log) {
        return JSON.parse(storageResponse.log);
      }
      return null;
    } catch (error) {
      throw new StorageError(error.message);
    }
  }

  /**
   * Removes all log entries from the browsers storage.
   */
  public async removeAll(): Promise<void> {
    try {
      await this.storageArea.remove("log");
    } catch (error) {
      throw new StorageError(error.message);
    }
  }

  /**
   * Writes a {@link LogEntry} to the storage
   * @param logEntry The log entry to be written.
   */
  // eslint-disable-next-line max-lines-per-function
  private async writeLog(logEntry: LogEntry): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let storageResponse: any;
    try {
      storageResponse = await this.storageArea.get(["log"]);
    } catch {
      const noLogMessage = LogFactory.formatLogEntry(
        new LogEntry(
          logEntry.requestUuid,
          LogLevel.WARNING,
          Date.now(),
          "Log could not be read.",
          new StorageError()
        )
      );
      console.warn(noLogMessage);
      return;
    }

    let logEntries: LogEntry[] = [];
    if (storageResponse.log !== undefined) {
      logEntries = <LogEntry[]>JSON.parse(storageResponse.log);
      logEntries = this.logRotate(logEntries);
    } else {
      const noLogMessage = LogFactory.formatLogEntry(
        new LogEntry(
          logEntry.requestUuid,
          LogLevel.INFO,
          Date.now(),
          "No log found. Creating new...",
          new StorageError()
        )
      );
      console.log(noLogMessage);
    }
    logEntries.push(logEntry);
    try {
      await this.storageArea.set({ log: JSON.stringify(logEntries) });
    } catch {
      const noLogMessage = LogFactory.formatLogEntry(
        new LogEntry(
          logEntry.requestUuid,
          LogLevel.WARNING,
          Date.now(),
          "Log could not be written.",
          new StorageError()
        )
      );
      console.warn(noLogMessage);
      return;
    }
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
