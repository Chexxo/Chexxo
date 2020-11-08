jest.mock("./providers/__mocks__/MockCertificateProvider");
jest.mock("./providers/CertificateAnalyzer");
jest.mock("./stores/CertificateStore");

import { deepMock, MockzillaDeep } from "mockzilla";
import { Browser, Runtime } from "webextension-polyfill-ts";
import Certificate from "../types/CommonTypes/certificate/Certificate";
import Issuer from "../types/CommonTypes/certificate/Issuer";
import Subject from "../types/CommonTypes/certificate/Subject";
import ErrorMessage from "../types/errors/ErrorMessage";
import UnhandledMessageError from "../types/errors/UnhandledMessageError";
import { Quality } from "../types/Quality";

import App from "./App";
import CertificateAnalyzer from "./providers/CertificateAnalyzer";
// eslint-disable-next-line jest/no-mocks-import
import MockCertificateProvider from "./providers/__mocks__/MockCertificateProvider";
import CertificateStore from "./stores/CertificateStore";

let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let certificateProvider: MockCertificateProvider;
let certificateAnalyzer: CertificateAnalyzer;
let certificateStore: CertificateStore;
let app: App;

beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  certificateProvider = new MockCertificateProvider();
  certificateAnalyzer = new CertificateAnalyzer();
  certificateStore = new CertificateStore(
    certificateProvider,
    certificateAnalyzer
  );

  mockBrowser.webRequest.onHeadersReceived.addListener.expect(
    expect.anything(),
    {
      urls: ["<all_urls>"],
      types: ["main_frame"],
    },
    ["blocking"]
  );
  mockBrowser.runtime.onMessage.addListener.expect(expect.anything());
  mockBrowser.tabs.onActivated.addListener.expect(expect.anything());
  mockBrowser.browserAction.setIcon.expect(expect.anything());
  mockBrowser.browserAction.setBadgeText.expect(expect.anything());
  mockBrowser.browserAction.setBadgeBackgroundColor.expect(expect.anything());

  app = new App(
    browser.webRequest.onHeadersReceived,
    browser.runtime.onMessage,
    browser.tabs.onActivated,
    browser.browserAction.setIcon,
    browser.browserAction.setBadgeText,
    browser.browserAction.setBadgeBackgroundColor,
    certificateStore
  );
});

// eslint-disable-next-line jest/expect-expect
test("initializes listeners", () => {
  app.init();
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

  certificateStore.getCertificate = jest.fn((tabId: number) => {
    expect(tabId).toEqual(message.params.tabId);
    return certificate;
  });

  app.init();
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

  certificateStore.getQuality = jest.fn((tabId: number) => {
    expect(tabId).toEqual(message.params.tabId);
    return Quality.DomainValidated;
  });

  app.init();
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

  certificateStore.getErrorMessage = jest.fn((tabId: number) => {
    expect(tabId).toEqual(message.params.tabId);
    return new ErrorMessage("I am an error.");
  });

  app.init();
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

  app.init();
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
