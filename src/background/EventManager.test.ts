jest.mock("./certificate/providers/__mocks__/MockCertificateProvider");
jest.mock("./certificate/CertificateService.ts");
jest.mock("./quality/helpers/QualityAnalyzer");
jest.mock("./App");

import { deepMock, MockzillaDeep } from "mockzilla";
import { Browser, Runtime } from "webextension-polyfill-ts";

import { Certificate } from "../types/certificate/Certificate";
import { Issuer } from "../types/certificate/Issuer";
import { Subject } from "../types/certificate/Subject";
import { ErrorMessage } from "../types/errors/ErrorMessage";
import { UnhandledMessageError } from "../types/errors/UnhandledMessageError";
import { Quality } from "../types/Quality";
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

beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  mockBrowser.storage.mockAllow();
  mockBrowser.storage.local.mockAllow();
  mockBrowser.storage.onChanged.addListener.expect(expect.anything());
  mockBrowser.webRequest.mockAllow();
  mockBrowser.webNavigation.mockAllow();
  mockBrowser.runtime.mockAllow();
  mockBrowser.tabs.mockAllow();
  mockBrowser.browserAction.mockAllow();
  mockBrowser.webRequest.onBeforeRequest.addListener.expect(
    expect.anything(),
    expect.anything(),
    expect.anything()
  );
  mockBrowser.webRequest.onHeadersReceived.addListener.expect(
    expect.anything(),
    expect.anything(),
    expect.anything()
  );
  mockBrowser.webNavigation.onErrorOccurred.addListener.expect(
    expect.anything()
  );
  mockBrowser.runtime.onMessage.addListener.expect(expect.anything());
  mockBrowser.tabs.onActivated.addListener.expect(expect.anything());

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
    browser.webRequest,
    browser.webNavigation,
    browser.runtime,
    browser.tabs,
    browser.browserAction,
    app
  );
});

test("returns Certificate on getCertificate message", () => {
  const message = { type: "getCertificate", params: { tabId: 1 } };
  const certificate = new Certificate(
    "0C:AA:F2:4A:B1:A0:C3:34:40:C0:6A:FE:99:DF:98:63:65:B0:78:1F",
    "a3:79:a6:f6:ee:af:b9:a5:5e:37:8c:11:80:34:e2:75:1e:68:2f:ab:9f:2d:30:ab:13:d2:12:55:86:ce:19:47",
    new Issuer("Example", "", "", "", "", ""),
    "",
    new Subject("example.com", "", "", "", "", ""),
    [],
    0,
    0,
    []
  );

  app.getCertificate = jest.fn((tabId: number) => {
    expect(tabId).toEqual(message.params.tabId);
    return certificate;
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
    expect(response).toEqual(certificate);
  });
});

test("returns Quality on getQuality message", () => {
  const message = { type: "getQuality", params: { tabId: 1 } };

  app.getQuality = jest.fn((tabId: number) => {
    expect(tabId).toEqual(message.params.tabId);
    return Quality.DomainValidated;
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
    expect(response).toEqual(Quality.DomainValidated);
  });
});

test("returns ErrorMessage on getErrorMessage message", () => {
  const message = { type: "getErrorMessage", params: { tabId: 1 } };

  app.getErrorMessage = jest.fn((tabId: number) => {
    expect(tabId).toEqual(message.params.tabId);
    return new ErrorMessage("I am an error.");
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
    expect(response).toBeInstanceOf(ErrorMessage);
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
  eventManager.receiveWebRequestHeaders(<any>{});
  expect(app.fetchCertificate).toHaveBeenCalledTimes(1);
});

test("calls changeBrowserAction on receiveWebRequestError", () => {
  app.analyzeError = jest.fn();
  eventManager.changeBrowserAction = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventManager.receiveWebNavigationError(<any>{});
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

  app.getErrorMessage = jest.fn(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <any>{
      hello: "World",
    };
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
  eventManager.resetTabData(<any>{});
  expect(app.resetTabData).toHaveBeenCalledTimes(1);
});
