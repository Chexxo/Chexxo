jest.mock("./certificate/providers/__mocks__/MockCertificateProvider");
jest.mock("./certificate/CertificateService.ts");
jest.mock("./quality/helpers/QualityAnalyzer");
jest.mock("./App");

import { deepMock, MockzillaDeep } from "mockzilla";
import { Browser, Runtime } from "webextension-polyfill-ts";

import { ErrorMessage } from "../types/errors/ErrorMessage";
import { UnhandledMessageError } from "../types/errors/UnhandledMessageError";
import { App } from "./App";
import { CertificateService } from "./certificate/CertificateService";
// eslint-disable-next-line jest/no-mocks-import
import { MockCertificateProvider } from "./certificate/providers/__mocks__/MockCertificateProvider";
import { EventManager } from "./EventManager";
import { QualityProvider } from "./quality/providers/QualityProvider";
import { QualityService } from "./quality/QualityService";
import { Configurator } from "../helpers/Configurator";
import { InBrowserPersistenceManager } from "./logger/InBrowserPersistenceManager";
import { InBrowserLogger } from "./logger/InBrowserLogger";
import { TabData } from "../types/TabData";

let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let certificateProvider: MockCertificateProvider;
let certificateService: CertificateService;
let qualityProvider: QualityProvider;
let qualityService: QualityService;
let configurator: Configurator;
let app: App;
let eventManager: EventManager;
let logger: InBrowserLogger;

// eslint-disable-next-line max-lines-per-function
beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  mockBrowser.storage.mockAllow();
  mockBrowser.storage.onChanged.addListener.expect(expect.anything());
  mockBrowser.storage.local.mockAllow();
  mockBrowser.webNavigation.mockAllow();
  mockBrowser.runtime.mockAllow();
  mockBrowser.tabs.mockAllow();
  mockBrowser.browserAction.mockAllow();
  mockBrowser.webNavigation.onBeforeNavigate.addListener.expect(
    expect.anything()
  );
  mockBrowser.webNavigation.onCommitted.addListener.expect(expect.anything());
  mockBrowser.webNavigation.onErrorOccurred.addListener.expect(
    expect.anything()
  );
  mockBrowser.webNavigation.onCompleted.addListener.expect(expect.anything());
  mockBrowser.runtime.onMessage.addListener.expect(expect.anything());

  certificateProvider = new MockCertificateProvider();
  certificateService = new CertificateService(certificateProvider);
  qualityProvider = new QualityProvider(browser.storage.local);
  qualityService = new QualityService(qualityProvider);
  configurator = new Configurator(browser.storage);
  logger = new InBrowserLogger(
    new InBrowserPersistenceManager(browser.storage.local)
  );
  app = new App(certificateService, qualityService, configurator, logger);
  app.init();

  eventManager = new EventManager(
    browser.webNavigation,
    browser.runtime,
    browser.tabs,
    browser.browserAction,
    app
  );
});

test("returns TabData on getTabData message", () => {
  const message = { type: "getCertificate", params: { tabId: 1 } };
  const tabData = new TabData(undefined, undefined, undefined);

  app.getTabData = jest.fn((tabId: number) => {
    expect(tabId).toEqual(message.params.tabId);
    return tabData;
  });

  eventManager.init();
  const receiveMessage: (
    message: {
      type: string;
      params: unknown;
    },
    sender: Runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => void | Promise<
    unknown
  > = mockBrowser.runtime.onMessage.addListener.getMockCalls()[0][0];

  receiveMessage(message, {}, (response: unknown) => {
    expect(response).toEqual(tabData);
  });
});

test("returns UnhandledMessageError on unhandled message", () => {
  const message = { type: "getPotato", params: undefined };

  eventManager.init();
  const receiveMessage: (
    message: {
      type: string;
      params: unknown;
    },
    sender: Runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => void | Promise<
    unknown
  > = mockBrowser.runtime.onMessage.addListener.getMockCalls()[0][0];

  receiveMessage(message, {}, (response: unknown) => {
    expect(response).toBeInstanceOf(UnhandledMessageError);
  });
});

test("calls fetch on receiveWebRequest", () => {
  app.fetchCertificate = jest.fn(() => {
    return new Promise((resolve) => {
      resolve();
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventManager.receiveWebRequestHeaders(<any>{
    url: "https://example.com",
    tabId: 0,
    parentFrameId: -1,
  });
  expect(app.fetchCertificate).toHaveBeenCalledTimes(1);
});

test("calls changeBrowserAction on receiveWebRequestError", () => {
  app.analyzeError = jest.fn();
  eventManager.changeBrowserAction = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventManager.receiveWebNavigationError(<any>{
    url: "https://example.com",
    tabId: 0,
    frameId: 0,
    error: "error",
  });
  expect(eventManager.changeBrowserAction).toHaveBeenCalledTimes(1);
});

test("sets error in changeBrowserAction", () => {
  mockBrowser.browserAction.setIcon
    .expect({ path: "../assets/logo_error.svg" })
    .andResolve();
  mockBrowser.browserAction.setBadgeBackgroundColor
    .expect({ color: "#d32f2f" })
    .andResolve();
  mockBrowser.browserAction.setBadgeText.expect({ text: "!" }).andResolve();

  app.getTabData = jest.fn(() => {
    return new TabData(undefined, undefined, new ErrorMessage("error"));
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(eventManager.changeBrowserAction(<any>{})).toEqual(undefined);
});

test("calls export log", () => {
  app.exportLogs = jest.fn();
  eventManager.receiveMessage({ type: "exportLogs" });
  expect(app.exportLogs).toHaveBeenCalledTimes(1);
});

test("returns error on export log", async () => {
  app.exportLogs = jest.fn(() => {
    throw new Error();
  });

  await expect(
    eventManager.receiveMessage({ type: "exportLogs" })
  ).rejects.toBeInstanceOf(Error);
});

test("calls remove log", () => {
  app.removeLogs = jest.fn();
  eventManager.receiveMessage({ type: "removeLogs" });
  expect(app.removeLogs).toHaveBeenCalledTimes(1);
});

test("returns error on remove log", async () => {
  app.removeLogs = jest.fn(() => {
    throw new Error();
  });

  await expect(
    eventManager.receiveMessage({ type: "removeLogs" })
  ).rejects.toBeInstanceOf(Error);
});

test("relay tabData", () => {
  app.resetTabData = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventManager.resetTab(<any>{
    url: "http://example.com",
    tabId: 0,
    parentFrameId: -1,
  });
  expect(app.resetTabData).toHaveBeenCalledTimes(1);
});
