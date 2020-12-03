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

const requestUuid = "abc123";

const logEntryInfo = new LogEntry(
  requestUuid,
  LogLevel.INFO,
  Date.now(),
  "Hello Info!"
);
const logEntryWarning = new LogEntry(
  requestUuid,
  LogLevel.WARNING,
  Date.now(),
  "Hello Warning!"
);
const logEntryError = new LogEntry(
  requestUuid,
  LogLevel.ERROR,
  Date.now(),
  "Hello Error!"
);

let log = "";

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
  const logArray = [];
  logArray.push(
    new LogEntry(requestUuid, LogLevel.WARNING, date1, "Hello World")
  );
  logArray.push(
    new LogEntry(requestUuid, LogLevel.WARNING, date2, "Hello World")
  );
  log = JSON.stringify(logArray);

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
    remove: jest.fn(() => {
      log = "";
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
    return persistence.save(logEntryInfo).then(() => {
      expect(global.console.log).toHaveBeenLastCalledWith(
        expect.stringMatching(/Hello Info!/)
      );
    });
  });

  test("Writes warning to console", () => {
    return persistence.save(logEntryWarning).then(() => {
      expect(global.console.warn).toHaveBeenLastCalledWith(
        expect.stringMatching(/Hello Warning!/)
      );
    });
  });

  test("Writes error to console", () => {
    return persistence.save(logEntryError).then(() => {
      expect(global.console.error).toHaveBeenLastCalledWith(
        expect.stringMatching(/Hello Error!/)
      );
    });
  });

  test("Writes error to log", () => {
    return persistence.save(logEntryError).then(() => {
      expect(JSON.parse(log).length).toBe(3);
    });
  });

  test("Writes warning to log", () => {
    return persistence.save(logEntryWarning).then(() => {
      expect(JSON.parse(log).length).toBe(3);
    });
  });

  test("Does not write info to log", () => {
    return persistence.save(logEntryInfo).then(() => {
      expect(JSON.parse(log).length).toBe(2);
    });
  });

  test("Takes uuid from request", () => {
    const logEntry = new LogEntry(
      "abc123",
      LogLevel.ERROR,
      Date.now(),
      "Hello",
      new ConnectionRefusedError()
    );
    return persistence.save(logEntry).then(() => {
      expect(global.console.error).toHaveBeenLastCalledWith(
        expect.stringMatching(/\[abc123\]/)
      );
    });
  });

  test("Works on empty array", () => {
    log = JSON.stringify([]);
    return persistence
      .save(new LogEntry(requestUuid, LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(JSON.parse(log).length).toBe(1);
      });
  });

  test("Works if log is undefined", () => {
    storageArea.get = jest.fn().mockImplementation(() => {
      return {};
    });

    return persistence
      .save(new LogEntry(requestUuid, LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(JSON.parse(log).length).toBe(1);
      });
  });

  test("Writes warning if log cannot be read", () => {
    storageArea.get = jest.fn(() => {
      throw new Error();
    });
    return persistence
      .save(new LogEntry(requestUuid, LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(console.warn).toHaveBeenLastCalledWith(
          expect.stringMatching(/Log could not be read./)
        );
      });
  });

  test("Writes warning if log cannot be written", () => {
    storageArea.set = jest.fn(() => {
      throw new Error();
    });
    return persistence
      .save(new LogEntry(requestUuid, LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(console.warn).toHaveBeenLastCalledWith(
          expect.stringMatching(/Log could not be written./)
        );
      });
  });
});

describe("logrotate()", () => {
  test("Removes old logs", () => {
    const logArray = JSON.parse(log);
    logArray.splice(
      0,
      0,
      new LogEntry(requestUuid, LogLevel.WARNING, date3, "Hello Old")
    );
    log = JSON.stringify(logArray);

    return persistence
      .save(new LogEntry(requestUuid, LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(JSON.parse(log).length).toBe(3);
      });
  });

  test("Removes multiple old logs", () => {
    const logArray = JSON.parse(log);
    logArray.splice(
      0,
      0,
      new LogEntry(requestUuid, LogLevel.WARNING, date3 - 1000, "Hi oldest")
    );
    logArray.splice(
      0,
      0,
      new LogEntry(requestUuid, LogLevel.WARNING, date3 - 500, "Hi older")
    );
    logArray.splice(
      0,
      0,
      new LogEntry(requestUuid, LogLevel.WARNING, date3, "Hi Old")
    );
    log = JSON.stringify(logArray);

    return persistence
      .save(new LogEntry(requestUuid, LogLevel.ERROR, Date.now(), "Hello"))
      .then(() => {
        expect(JSON.parse(log).length).toBe(3);
      });
  });
});

describe("getAll()", () => {
  test("Returns all logs", () => {
    return persistence.getAll().then((data) => {
      expect(data).toEqual(JSON.parse(log));
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
    log = JSON.stringify([]);
    return persistence.getAll().then((data) => {
      expect(data).toStrictEqual([]);
    });
  });
});

describe("deleteAll()", () => {
  test("removes all logs", () => {
    return persistence.removeAll().then(() => {
      expect(storageArea.remove).toHaveBeenCalledTimes(1);
    });
  });
});

afterAll(() => {
  global.console = consoleSave;
});
