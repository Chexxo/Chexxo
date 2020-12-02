jest.mock("./certificate/providers/__mocks__/MockCertificateProvider");
jest.mock("./certificate/CertificateService");
jest.mock("./quality/helpers/QualityAnalyzer");

import { Browser, WebRequest } from "webextension-polyfill-ts";
import { deepMock, MockzillaDeep } from "mockzilla";

// eslint-disable-next-line jest/no-mocks-import
import { MockCertificateProvider } from "./certificate/providers/__mocks__/MockCertificateProvider";
import { QualityProvider } from "./quality/providers/QualityProvider";
import { QualityService } from "./quality/QualityService";
import { Certificate } from "../types/certificate/Certificate";
import { App } from "./App";
import { CertificateService } from "./certificate/CertificateService";
import { Issuer } from "../types/certificate/Issuer";
import { Subject } from "../types/certificate/Subject";
import { ErrorMessage } from "../types/errors/ErrorMessage";
import { UntrustedRootError } from "../types/errors/certificate/UntrustedRootError";
import { Quality } from "../types/Quality";
import { Configurator } from "../helpers/Configurator";
import { CertificateResponse } from "../types/certificate/CertificateResponse";
import { LogLevel } from "../shared/logger/Logger";
import { InBrowserPersistenceManager } from "./logger/InBrowserPersistenceManager";
import { InsecureConnectionError } from "../types/errors/InsecureConnectionError";
import { InvalidUrlError } from "../shared/types/errors/InvalidUrlError";
import { ServerError } from "../shared/types/errors/ServerError";
import { InBrowserLogger } from "./logger/InBrowserLogger";

let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let certificateProvider: MockCertificateProvider;
let certificateService: CertificateService;
let qualityProvider: QualityProvider;
let qualityService: QualityService;
let configurator: Configurator;
let app: App;
let tabId: number;
let onHeadersReceivedDetails: WebRequest.OnHeadersReceivedDetailsType;
let certificate: Certificate;
let logger: InBrowserLogger;

const requestUuid = "abc123";

let windowSpy = jest.spyOn(window, "window", "get");
const consoleSave = global.console;

beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  mockBrowser.storage.mockAllow();
  mockBrowser.storage.local.mockAllow();
  mockBrowser.storage.onChanged.addListener.expect(expect.anything());
  certificateProvider = new MockCertificateProvider();
  certificateService = new CertificateService(certificateProvider);
  qualityProvider = new QualityProvider();
  qualityService = new QualityService(qualityProvider);
  configurator = new Configurator(browser.storage);
  logger = new InBrowserLogger(
    new InBrowserPersistenceManager(browser.storage.local)
  );

  app = new App(certificateService, qualityService, configurator, logger);
  app.init();
  tabId = 1;
  onHeadersReceivedDetails = {
    requestId: "1",
    url: "https://example.com/",
    method: "GET",
    frameId: 0,
    parentFrameId: -1,
    tabId,
    type: "main_frame",
    timeStamp: 0,
    statusLine: "HTTP/2.0 200 OK",
    statusCode: 200,
    thirdParty: false,
  };
  certificate = new Certificate(
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

  windowSpy = jest.spyOn(window, "window", "get");
  windowSpy.mockImplementation(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <any>{
        crypto: {
          getRandomValues: jest.fn(),
        },
      }
  );

  global.console = <Console>(<unknown>{
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });
});

afterEach(() => {
  windowSpy.mockRestore();
  global.console = consoleSave;
});

test("caches certificate from CertificateService", async () => {
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((resolve) => {
      resolve(new CertificateResponse(requestUuid, certificate));
    });
  });

  await app.fetchCertificate(onHeadersReceivedDetails);
  expect(app.getCertificate(tabId)).toEqual(certificate);
});

test("caches quality from QualityService", async () => {
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((resolve) => {
      resolve(new CertificateResponse(requestUuid, certificate));
    });
  });

  qualityService.getQuality = jest.fn(() => {
    return Quality.DomainValidated;
  });

  await app.fetchCertificate(onHeadersReceivedDetails);
  expect(app.getQuality(tabId)).toEqual(Quality.DomainValidated);
});

test("catches errormessages from CertificateService", async () => {
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((_, reject) => {
      reject(new Error());
    });
  });

  await expect(
    app.fetchCertificate(onHeadersReceivedDetails)
  ).resolves.not.toThrowError();

  await expect(app.getErrorMessage(tabId)).toBeInstanceOf(ErrorMessage);
});

test("writes  unknown error to log", async () => {
  logger.log = jest.fn();
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((_, reject) => {
      reject(new Error());
    });
  });

  await expect(
    app.fetchCertificate(onHeadersReceivedDetails)
  ).resolves.not.toThrowError();

  expect(logger.log).toHaveBeenLastCalledWith(
    expect.anything(),
    LogLevel.ERROR,
    "Unknown Error",
    expect.anything()
  );
});

test("writes normal CodedError from InBrowser provider to log", async () => {
  logger.log = jest.fn();
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((_, reject) => {
      reject(
        new CertificateResponse(
          requestUuid,
          undefined,
          new InsecureConnectionError()
        )
      );
    });
  });

  await expect(
    app.fetchCertificate(onHeadersReceivedDetails)
  ).resolves.not.toThrowError();

  expect(logger.log).toHaveBeenLastCalledWith(
    expect.anything(),
    LogLevel.WARNING,
    "Server responded with an insecure connection.",
    expect.anything()
  );
});

test("writes normal CodedError from Server provider to log", async () => {
  logger.log = jest.fn();
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((_, reject) => {
      reject(
        new CertificateResponse(requestUuid, undefined, new InvalidUrlError())
      );
    });
  });

  await expect(
    app.fetchCertificate(onHeadersReceivedDetails)
  ).resolves.not.toThrowError();

  expect(logger.log).toHaveBeenLastCalledWith(
    expect.anything(),
    LogLevel.WARNING,
    "The url provided is not valid.",
    expect.anything()
  );
});

test("writes ServerError from Server provider to log", async () => {
  logger.log = jest.fn();
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((_, reject) => {
      reject(
        new CertificateResponse(requestUuid, undefined, new ServerError())
      );
    });
  });

  await expect(
    app.fetchCertificate(onHeadersReceivedDetails)
  ).resolves.not.toThrowError();

  expect(logger.log).toHaveBeenLastCalledWith(
    expect.anything(),
    LogLevel.ERROR,
    "An internal server error occured.",
    expect.anything()
  );
});

test("writes unknown error from ErrorResponse to log", async () => {
  logger.log = jest.fn();
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((_, reject) => {
      reject(new CertificateResponse(requestUuid, undefined, new Error()));
    });
  });

  await expect(
    app.fetchCertificate(onHeadersReceivedDetails)
  ).resolves.not.toThrowError();

  expect(logger.log).toHaveBeenLastCalledWith(
    expect.anything(),
    LogLevel.ERROR,
    "Unknown Error",
    expect.anything()
  );
});

test("caches errormessages from OnErrorOccured event", () => {
  const requestDetails = { url: "", tabId: 0, frameId: 0, error: "" };

  certificateService.analyzeError = jest.fn(() => {
    return new UntrustedRootError();
  });

  app.analyzeError(requestDetails);
  expect(app.getErrorMessage(requestDetails.tabId)).toBeInstanceOf(
    ErrorMessage
  );
});
