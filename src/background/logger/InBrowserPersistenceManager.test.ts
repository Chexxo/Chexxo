import { LogLevel } from "../../shared/logger/Logger";
import { LogEntry } from "../../shared/types/logger/LogEntry";
import { InBrowserPersistenceManager } from "./InBrowserPersistenceManager";
import { Storage } from "webextension-polyfill-ts";
import { ConnectionRefusedError } from "../../shared/types/errors/ConnectionRefusedError";

const millisecondsADay = 86_400_000;
const logDays = 14;

const date1 = Date.now();
const date2 = Date.now() + 50;
const date3 = Date.now() - logDays * millisecondsADay;

const requestUuid = "";

const logEntryInfo = new LogEntry(LogLevel.INFO, Date.now(), "Hello Info!");
const logEntryWarning = new LogEntry(
  LogLevel.WARNING,
  Date.now(),
  "Hello Warning!"
);
const logEntryError = new LogEntry(LogLevel.ERROR, Date.now(), "Hello Error!");

let log: LogEntry[] = [];

let storageArea: Storage.StorageArea;
const consoleSave = global.console;
const windowSave = global.window;

beforeAll(() => {
  global.console = <Console>(<unknown>{
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });
});

let persistence: InBrowserPersistenceManager;

let windowSpy = jest.spyOn(window, "window", "get");
beforeEach(() => {
  jest.resetAllMocks();
  log = [];
  log.push(new LogEntry(LogLevel.WARNING, date1, "Hello World"));
  log.push(new LogEntry(LogLevel.WARNING, date2, "Hello World"));

  storageArea = <Storage.StorageArea>(<unknown>{
    get: jest.fn().mockImplementation(() => {
      return {
        log: log,
      };
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: jest.fn((object: any) => {
      log = object.log;
    }),
  });

  persistence = new InBrowserPersistenceManager(storageArea);

  windowSpy = jest.spyOn(windowSave, "window", "get");
  windowSpy.mockImplementation(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <any>{
        crypto: {
          getRandomValues: jest.fn(),
        },
      }
  );
});

afterEach(() => {
  windowSpy.mockRestore();
});

describe("save()", () => {
  test("Writes info to console", () => {
    return persistence.save(requestUuid, logEntryInfo).then(() => {
      expect(global.console.log).toHaveBeenLastCalledWith(
        expect.stringMatching(/Hello Info!/)
      );
    });
  });

  test("Writes warning to console", () => {
    return persistence.save(requestUuid, logEntryWarning).then(() => {
      expect(global.console.warn).toHaveBeenLastCalledWith(
        expect.stringMatching(/Hello Warning!/)
      );
    });
  });

  test("Writes error to console", () => {
    return persistence.save(requestUuid, logEntryError).then(() => {
      expect(global.console.error).toHaveBeenLastCalledWith(
        expect.stringMatching(/Hello Error!/)
      );
    });
  });

  test("Writes error to log", () => {
    return persistence.save(requestUuid, logEntryError).then(() => {
      expect(log.length).toBe(3);
    });
  });

  test("Writes warning to log", () => {
    return persistence.save(requestUuid, logEntryWarning).then(() => {
      expect(log.length).toBe(3);
    });
  });

  test("Does not write info to log", () => {
    return persistence.save(requestUuid, logEntryInfo).then(() => {
      expect(log.length).toBe(2);
    });
  });

  test("Takes uuid from request", () => {
    const logEntry = new LogEntry(
      LogLevel.ERROR,
      Date.now(),
      "Hello",
      new ConnectionRefusedError()
    );
    return persistence.save("abc123", logEntry).then(() => {
      expect(global.console.error).toHaveBeenLastCalledWith(
        expect.stringMatching(/\[abc123\]/)
      );
    });
  });

  test("Works on empty array", () => {
    log = [];
    return persistence
      .save(requestUuid, new LogEntry(LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(log.length).toBe(1);
      });
  });

  test("Works if log is undefined", () => {
    storageArea.get = jest.fn().mockImplementation(() => {
      return {};
    });

    return persistence
      .save(requestUuid, new LogEntry(LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(log.length).toBe(1);
      });
  });
});

describe("logrotate()", () => {
  test("Removes old logs", () => {
    log.splice(0, 0, new LogEntry(LogLevel.WARNING, date3, "Hello Old"));
    return persistence
      .save(requestUuid, new LogEntry(LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(log.length).toBe(3);
      });
  });

  test("Removes multiple old logs", () => {
    log.splice(0, 0, new LogEntry(LogLevel.WARNING, date3 - 1000, "Hi oldest"));
    log.splice(0, 0, new LogEntry(LogLevel.WARNING, date3 - 500, "Hi older"));
    log.splice(0, 0, new LogEntry(LogLevel.WARNING, date3, "Hi Old"));
    return persistence
      .save(requestUuid, new LogEntry(LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(log.length).toBe(3);
      });
  });
});

describe("getAll()", () => {
  test("Returns all logs", () => {
    return persistence.getAll().then((data) => {
      expect(data).toEqual(log);
    });
  });

  test("Returns null if no logs exist", () => {
    storageArea.get = jest.fn().mockImplementation(() => {
      return {};
    });

    return persistence.getAll().then((data) => {
      expect(data).toBe(null);
    });
  });

  test("Returns empty array if log is empty array", () => {
    log = [];
    return persistence.getAll().then((data) => {
      expect(data).toStrictEqual([]);
    });
  });
});

afterAll(() => {
  global.console = consoleSave;
});
