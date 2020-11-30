import { deepMock, MockzillaDeep } from "mockzilla";
import { Browser } from "webextension-polyfill-ts";
import { Configuration } from "../types/Configuration";
import { Configurator } from "./Configurator";

let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let configurator: Configurator;

beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  mockBrowser.storage.local.mockAllow();
  mockBrowser.storage.onChanged.addListener.expect(expect.anything());
  configurator = new Configurator(browser.storage);
});

test("retrieves configuration when it is defined", async () => {
  const configuration = new Configuration("http://localhost:3000", false, true);

  mockBrowser.storage.local.get
    .expect(expect.anything())
    .andResolve({ configuration });

  await expect(configurator.getConfiguration()).resolves.toEqual(configuration);
});

test("retrieves default configuration when no configuration defined", async () => {
  mockBrowser.storage.local.get.expect(expect.anything()).andResolve({});

  await expect(configurator.getConfiguration()).resolves.toEqual(
    configurator["defaultConfiguration"]
  );
});

test("throws error when storage get operation failed", async () => {
  mockBrowser.storage.local.get
    .expect(expect.anything())
    .andReject(new Error());

  await expect(configurator.getConfiguration()).rejects.toThrowError();
});

test("sets provided configuration", async () => {
  const configuration = new Configuration("http://localhost:3000", false, true);

  mockBrowser.storage.local.set.expect({ configuration }).andResolve();
  await expect(configurator.setConfiguration(configuration)).resolves.toEqual(
    undefined
  );
});

test("throws error when storage set operation failed", async () => {
  const configuration = new Configuration("http://localhost:3000", false, true);

  mockBrowser.storage.local.set
    .expect(expect.anything())
    .andReject(new Error());

  await expect(
    configurator.setConfiguration(configuration)
  ).rejects.toThrowError();
});

test("listeners are correctly added to the array", () => {
  configurator.addListener(jest.fn());
  expect(configurator["changeListeners"].length).toBeGreaterThan(0);
});

test("listeners are called when configuration changes", async () => {
  mockBrowser.storage.local.get.expect(expect.anything()).andResolve({});

  const testListener = jest.fn((configuration: Configuration) => {
    expect(configuration).toBeDefined();
  });
  configurator.addListener(testListener);

  let storageChangeListener = mockBrowser.storage.onChanged.addListener.getMockCalls()[0][0];
  storageChangeListener = storageChangeListener.bind(configurator);
  await storageChangeListener(
    { configuration: { oldValue: "a", newValue: "b" } },
    "local"
  );

  expect(testListener).toHaveBeenCalled();
});
