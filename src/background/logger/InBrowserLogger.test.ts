import { InBrowserLogger } from "./InBrowserLogger";
import { InBrowserPersistenceManager } from "./InBrowserPersistenceManager";

let inBrowserPersistenceManager: InBrowserPersistenceManager;
let inBrowserLogger: InBrowserLogger;

beforeEach(() => {
  inBrowserPersistenceManager = <InBrowserPersistenceManager>(<unknown>{
    save: jest.fn(),
    getAll: jest.fn(),
    removeAll: jest.fn(),
  });
  inBrowserLogger = new InBrowserLogger(inBrowserPersistenceManager);
});

test("getAll is relaying", () => {
  return inBrowserLogger.getAll().then(() => {
    expect(inBrowserPersistenceManager.getAll).toHaveBeenCalledTimes(1);
  });
});

test("deleteAll is relaying", () => {
  return inBrowserLogger.removeAll().then(() => {
    expect(inBrowserPersistenceManager.removeAll).toHaveBeenCalledTimes(1);
  });
});
