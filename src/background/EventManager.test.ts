jest.mock("./certificate/providers/__mocks__/MockCertificateProvider");
jest.mock("./certificate/CertificateService.ts");
jest.mock("./quality/helpers/QualityAnalyzer");
jest.mock("./App");

import { deepMock, MockzillaDeep } from "mockzilla";
import { Browser, Runtime } from "webextension-polyfill-ts";
import Certificate from "../types/CommonTypes/certificate/Certificate";
import Issuer from "../types/CommonTypes/certificate/Issuer";
import Subject from "../types/CommonTypes/certificate/Subject";
import ErrorMessage from "../types/errors/ErrorMessage";
import UnhandledMessageError from "../types/errors/UnhandledMessageError";
import { Quality } from "../types/Quality";
import EventManager from "./EventManager";
// eslint-disable-next-line jest/no-mocks-import
import MockCertificateProvider from "./certificate/providers/__mocks__/MockCertificateProvider";
import App from "./App";
import CertificateService from "./certificate/CertificateService";
import QualityProvider from "./quality/providers/QualityProvider";
import QualityService from "./quality/QualityService";

let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let certificateProvider: MockCertificateProvider;
let certificateService: CertificateService;
let qualityProvider: QualityProvider;
let qualityService: QualityService;
let app: App;
let eventManager: EventManager;

beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  certificateProvider = new MockCertificateProvider();
  certificateService = new CertificateService(certificateProvider);
  qualityProvider = new QualityProvider();
  qualityService = new QualityService(qualityProvider);
  app = new App(certificateService, qualityService);

  mockBrowser.webRequest.onHeadersReceived.addListener.expect(
    expect.anything(),
    {
      urls: ["<all_urls>"],
      types: ["main_frame"],
    },
    ["blocking"]
  );
  mockBrowser.webNavigation.onErrorOccurred.addListener.expect(
    expect.anything()
  );
  mockBrowser.runtime.onMessage.addListener.expect(expect.anything());
  mockBrowser.tabs.onActivated.addListener.expect(expect.anything());
  mockBrowser.browserAction.setIcon.expect(expect.anything());
  mockBrowser.browserAction.setBadgeText.expect(expect.anything());
  mockBrowser.browserAction.setBadgeBackgroundColor.expect(expect.anything());

  eventManager = new EventManager(
    browser.webRequest.onHeadersReceived,
    browser.webNavigation.onErrorOccurred,
    browser.runtime.onMessage,
    browser.tabs.onActivated,
    browser.browserAction.setIcon,
    browser.browserAction.setBadgeText,
    browser.browserAction.setBadgeBackgroundColor,
    app
  );
});

// eslint-disable-next-line jest/expect-expect
test("initializes listeners", () => {
  eventManager.init();
});

test("returns Certificate on getCertificate message", () => {
  const message = { type: "getCertificate", params: { tabId: 1 } };
  const certificate = new Certificate(
    "0C:AA:F2:4A:B1:A0:C3:34:40:C0:6A:FE:99:DF:98:63:65:B0:78:1F",
    "a3:79:a6:f6:ee:af:b9:a5:5e:37:8c:11:80:34:e2:75:1e:68:2f:ab:9f:2d:30:ab:13:d2:12:55:86:ce:19:47",
    new Issuer("Example", "", "", "", "", ""),
    0,
    new Subject("example.com", "", "", "", "", ""),
    [],
    0,
    0,
    false
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
