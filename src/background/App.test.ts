jest.mock("./certificate/providers/__mocks__/MockCertificateProvider");
jest.mock("./certificate/CertificateService");
jest.mock("./quality/helpers/QualityAnalyzer");

import { WebRequest } from "webextension-polyfill-ts";

// eslint-disable-next-line jest/no-mocks-import
import MockCertificateProvider from "./certificate/providers/__mocks__/MockCertificateProvider";
import App from "./App";
import Issuer from "../types/certificate/Issuer";
import Subject from "../types/certificate/Subject";
import Certificate from "../types/certificate/Certificate";
import { Quality } from "../types/Quality";
import ErrorMessage from "../types/errors/ErrorMessage";
import CertificateService from "./certificate/CertificateService";
import QualityProvider from "./quality/providers/QualityProvider";
import QualityService from "./quality/QualityService";
import UntrustedRootError from "../types/errors/certificate/UntrustedRootError";

let certificateProvider: MockCertificateProvider;
let certificateService: CertificateService;
let qualityProvider: QualityProvider;
let qualityService: QualityService;
let app: App;
let tabId: number;
let onHeadersReceivedDetails: WebRequest.OnHeadersReceivedDetailsType;
let certificate: Certificate;

beforeEach(() => {
  certificateProvider = new MockCertificateProvider();
  certificateService = new CertificateService(certificateProvider);
  qualityProvider = new QualityProvider();
  qualityService = new QualityService(qualityProvider);
  app = new App(certificateService, qualityService);
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
});

test("caches certificate from CertificateService", async () => {
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((resolve) => {
      resolve(certificate);
    });
  });

  await app.fetchCertificate(onHeadersReceivedDetails);
  expect(app.getCertificate(tabId)).toEqual(certificate);
});

test("caches quality from QualityService", async () => {
  certificateService.getCertificate = jest.fn(() => {
    return new Promise((resolve) => {
      resolve(certificate);
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

test("caches errormessages from OnErrorOccured event", () => {
  const requestDetails = { tabId: 0, frameId: 0, error: "" };

  certificateService.analyzeError = jest.fn(() => {
    return new UntrustedRootError();
  });

  app.analyzeError(requestDetails);
  expect(app.getErrorMessage(requestDetails.tabId)).toBeInstanceOf(
    ErrorMessage
  );
});
