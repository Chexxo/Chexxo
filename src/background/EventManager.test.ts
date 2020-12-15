/* eslint-disable max-lines */
jest.mock("./App");

import { deepMock, MockzillaDeep } from "mockzilla";
import { Browser } from "webextension-polyfill-ts";

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
import { Configuration } from "../types/Configuration";
import { Quality } from "../types/Quality";

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

  eventManager = new EventManager(
    browser.webNavigation,
    browser.runtime,
    browser.tabs,
    browser.browserAction,
    app
  );
});

// eslint-disable-next-line max-lines-per-function
describe("init()", () => {
  test("initializes browser event listeners for mozilla firefox", () => {
    mockBrowser.webRequest.mockAllow();
    mockBrowser.webRequest.onHeadersReceived.addListener.expect(
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
    eventManager["webRequest"] = browser.webRequest;
    eventManager.init();
    expect(
      mockBrowser.webRequest.onHeadersReceived.addListener.getMockCalls()
    ).not.toEqual([]);
  });

  test("initializes browser event listeners for chromium browsers", () => {
    eventManager.init();
    expect(
      mockBrowser.webNavigation.onCommitted.addListener.getMockCalls()
    ).not.toEqual([]);
  });
});

describe("resetTab()", () => {
  test("resets tab, if requests is non https and main frame", () => {
    const requestDetails = {
      url: "http://example.com",
      tabId: 0,
      parentFrameId: -1,
    };
    eventManager.resetTab(requestDetails);
    expect(app.resetTabData).toHaveBeenCalled();
  });

  test("doesn't reset tab, if request is non main frame", () => {
    const requestDetails = {
      url: "http://example.com",
      tabId: 0,
      parentFrameId: 1,
    };
    eventManager.resetTab(requestDetails);
    expect(app.resetTabData).not.toHaveBeenCalled();
  });
});

// eslint-disable-next-line max-lines-per-function
describe("receiveWebRequestHeaders()", () => {
  test("returns request continue, if request is https, main frame and without quality decrease", async () => {
    const requestDetails = {
      url: "https://example.com",
      tabId: 0,
      parentFrameId: -1,
    };
    const response = eventManager.receiveWebRequestHeaders(requestDetails);
    await expect(response).resolves.toEqual({});
  });

  test("returns request continue, if request is non main frame", async () => {
    const requestDetails = {
      url: "https://example.com",
      tabId: 0,
      parentFrameId: 1,
    };
    const response = eventManager.receiveWebRequestHeaders(requestDetails);
    await expect(response).resolves.toEqual({});
  });

  test("returns request continue, if request is non https and main frame", async () => {
    const requestDetails = {
      url: "http://example.com",
      tabId: 0,
      parentFrameId: -1,
    };
    const response = eventManager.receiveWebRequestHeaders(requestDetails);
    await expect(response).resolves.toEqual({});
  });

  test("returns request cancel, if request is https, main frame and quality decreased", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockBrowser.tabs.update.expect as any)(
      expect.anything(),
      expect.anything()
    );
    mockBrowser.runtime.getURL.expect(expect.anything()).andReturn("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.analyzeQuality as jest.Mock<any, any>).mockResolvedValueOnce(true);
    const requestDetails = {
      url: "https://example.com",
      tabId: 0,
      parentFrameId: -1,
    };
    const response = eventManager.receiveWebRequestHeaders(requestDetails);
    await expect(response).resolves.toEqual({ cancel: true });
  });
});

// eslint-disable-next-line max-lines-per-function
describe("receiveWebNavigationError()", () => {
  test("analyzes error, if request is https and main frame", () => {
    const requestDetails = {
      url: "https://example.com",
      tabId: 0,
      frameId: 0,
      error: "error",
    };
    eventManager.receiveWebNavigationError(requestDetails);
    expect(app.analyzeError).toHaveBeenCalled();
  });

  test("doesn't analyze error, if request is non main frame", () => {
    const requestDetails = {
      url: "https://example.com",
      tabId: 0,
      frameId: 1,
      error: "error",
    };
    eventManager.receiveWebNavigationError(requestDetails);
    expect(app.analyzeError).not.toHaveBeenCalled();
  });

  test("doesn't analyze error, if request is non https", () => {
    const requestDetails = {
      url: "http://example.com",
      tabId: 0,
      frameId: 0,
      error: "error",
    };
    eventManager.receiveWebNavigationError(requestDetails);
    expect(app.analyzeError).not.toHaveBeenCalled();
  });
});

// eslint-disable-next-line max-lines-per-function
describe("receiveMessage()", () => {
  test("delegates getTabData message", () => {
    const message = {
      type: "getTabData",
      params: { tabId: 0 },
    };
    eventManager.receiveMessage(message);
    expect(app.getTabData).toHaveBeenCalled();
  });

  test("delegates resetQuality message", () => {
    const message = {
      type: "resetQuality",
      params: { url: "" },
    };
    eventManager.receiveMessage(message);
    expect(app.resetQuality).toHaveBeenCalled();
  });

  test("delegates getConfiguration message", () => {
    const message = { type: "getConfiguration" };
    eventManager.receiveMessage(message);
    expect(app.getConfiguration).toHaveBeenCalled();
  });

  test("delegates setConfiguration message", () => {
    const message = {
      type: "setConfiguration",
      params: new Configuration("", false),
    };
    eventManager.receiveMessage(message);
    expect(app.setConfiguration).toHaveBeenCalled();
  });

  test("delegates removeCache message", () => {
    const message = { type: "removeCache" };
    eventManager.receiveMessage(message);
    expect(app.removeCache).toHaveBeenCalled();
  });

  test("delegates exportLogs message", () => {
    const message = { type: "exportLogs" };
    eventManager.receiveMessage(message);
    expect(app.exportLogs).toHaveBeenCalled();
  });

  test("delegates removeLogs message", () => {
    const message = { type: "removeLogs" };
    eventManager.receiveMessage(message);
    expect(app.removeLogs).toHaveBeenCalled();
  });

  test("rejects unhandled message type", async () => {
    const message = { type: "impossibleMessage" };
    const response = eventManager.receiveMessage(message);
    await expect(response).rejects.toBeInstanceOf(UnhandledMessageError);
  });

  test("rejects getConfiguration message on StorageError", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.getConfiguration as jest.Mock<any, any>).mockImplementation(() => {
      throw new Error();
    });
    const message = { type: "getConfiguration" };
    const response = eventManager.receiveMessage(message);
    await expect(response).rejects.toBeInstanceOf(Error);
  });

  test("rejects setConfiguration message on StorageError", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.setConfiguration as jest.Mock<any, any>).mockImplementation(() => {
      throw new Error();
    });
    const message = {
      type: "setConfiguration",
      params: new Configuration("", false),
    };
    const response = eventManager.receiveMessage(message);
    await expect(response).rejects.toBeInstanceOf(Error);
  });

  test("rejects exportLogs message on StorageError", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.exportLogs as jest.Mock<any, any>).mockImplementation(() => {
      throw new Error();
    });
    const message = { type: "exportLogs" };
    const response = eventManager.receiveMessage(message);
    await expect(response).rejects.toBeInstanceOf(Error);
  });

  test("rejects removeLogs message on StorageError", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.removeLogs as jest.Mock<any, any>).mockImplementation(() => {
      throw new Error();
    });
    const message = { type: "removeLogs" };
    const response = eventManager.receiveMessage(message);
    await expect(response).rejects.toBeInstanceOf(Error);
  });
});

// eslint-disable-next-line max-lines-per-function
describe("changeBrowserAction()", () => {
  test("sets quality icon, if request is https, mainframe and without errors", () => {
    mockBrowser.browserAction.enable.expect(expect.anything());
    eventManager["setQualityIcon"] = jest.fn();
    const requestDetails = {
      url: "https://example.com",
      tabId: 0,
      parentFrameId: -1,
    };
    eventManager.changeBrowserAction(requestDetails);
    expect(eventManager["setQualityIcon"]).toHaveBeenCalled();
  });

  test("disables browserAction, if request is non https", () => {
    mockBrowser.browserAction.setIcon.expect(expect.anything());
    mockBrowser.browserAction.setBadgeBackgroundColor.expect(expect.anything());
    mockBrowser.browserAction.disable.expect(expect.anything());
    const requestDetails = {
      url: "http://example.com",
      tabId: 0,
      parentFrameId: -1,
    };
    eventManager.changeBrowserAction(requestDetails);
    expect(mockBrowser.browserAction.disable.getMockCalls()).not.toEqual([]);
  });

  test("sets error icon, if request has errors", () => {
    mockBrowser.browserAction.enable.expect(expect.anything());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.getTabData as jest.Mock<any, any>).mockReturnValueOnce(
      new TabData(undefined, undefined, new ErrorMessage("error"))
    );
    eventManager["setErrorIcon"] = jest.fn();
    const requestDetails = {
      url: "https://example.com",
      tabId: 0,
      parentFrameId: -1,
    };
    eventManager.changeBrowserAction(requestDetails);
    expect(eventManager["setErrorIcon"]).toHaveBeenCalled();
  });
});

describe("setErrorIcon()", () => {
  test("sets error icon on tabId", () => {
    mockBrowser.browserAction.setIcon.expect(expect.anything());
    mockBrowser.browserAction.setBadgeBackgroundColor.expect(expect.anything());
    mockBrowser.browserAction.setBadgeText.expect(expect.anything());
    eventManager["setErrorIcon"](5);
    expect(mockBrowser.browserAction.setIcon.getMockCalls()[0]).toEqual([
      {
        path: "../assets/logo_error.svg",
        tabId: 5,
      },
    ]);
  });
});

describe("setQualityIcon()", () => {
  test("sets quality icon with quality", () => {
    mockBrowser.browserAction.setIcon.expect(expect.anything());
    mockBrowser.browserAction.setBadgeBackgroundColor.expect(expect.anything());
    mockBrowser.browserAction.setBadgeText.expect(expect.anything());
    eventManager["setQualityIcon"](5, Quality.DomainValidated);
    expect(mockBrowser.browserAction.setBadgeText.getMockCalls()[0]).toEqual([
      { tabId: 5, text: "*" },
    ]);
  });

  test("sets quality icon without quality", () => {
    mockBrowser.browserAction.setIcon.expect(expect.anything());
    mockBrowser.browserAction.setBadgeBackgroundColor.expect(expect.anything());
    mockBrowser.browserAction.setBadgeText.expect(expect.anything());
    eventManager["setQualityIcon"](5);
    expect(mockBrowser.browserAction.setBadgeText.getMockCalls()[0]).toEqual([
      { tabId: 5, text: "" },
    ]);
  });
});
