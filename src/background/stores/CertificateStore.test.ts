jest.mock("../providers/__mocks__/MockCertificateProvider");
jest.mock("../providers/QualityAnalyzer");

import { WebRequest } from "webextension-polyfill-ts";

// eslint-disable-next-line jest/no-mocks-import
import MockCertificateProvider from "../providers/__mocks__/MockCertificateProvider";
import QualityAnalyzer from "../providers/QualityAnalyzer";
import CertificateStore from "./CertificateStore";
import Issuer from "../../types/CommonTypes/certificate/Issuer";
import Subject from "../../types/CommonTypes/certificate/Subject";
import Certificate from "../../types/CommonTypes/certificate/Certificate";
import { Quality } from "../../types/Quality";
import ErrorMessage from "../../types/errors/ErrorMessage";

let certificateProvider: MockCertificateProvider;
let qualityAnalyzer: QualityAnalyzer;
let certificateStore: CertificateStore;
let tabId: number;
let onHeadersReceivedDetails: WebRequest.OnHeadersReceivedDetailsType;
let certificate: Certificate;

beforeEach(() => {
  certificateProvider = new MockCertificateProvider();
  qualityAnalyzer = new QualityAnalyzer();
  certificateStore = new CertificateStore(certificateProvider, qualityAnalyzer);
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
    0,
    new Subject("example.com", "", "", "", "", ""),
    [],
    0,
    0,
    false
  );
});

test("caches certificate from CertificateProvider", async () => {
  certificateProvider.getCertificate = jest.fn(() => {
    return new Promise((resolve) => {
      resolve(certificate);
    });
  });

  await certificateStore.fetchCertificate(onHeadersReceivedDetails);
  expect(certificateStore.getCertificate(tabId)).toEqual(certificate);
});

test("caches quality from QualityAnalyzer", async () => {
  certificateProvider.getCertificate = jest.fn(() => {
    return new Promise((resolve) => {
      resolve(certificate);
    });
  });

  qualityAnalyzer.getQuality = jest.fn(() => {
    return Quality.DomainValidated;
  });

  await certificateStore.fetchCertificate(onHeadersReceivedDetails);
  expect(certificateStore.getQuality(tabId)).toEqual(Quality.DomainValidated);
});

test("catches errors from CertificateProvider", async () => {
  certificateProvider.getCertificate = jest.fn(() => {
    return new Promise((_, reject) => {
      reject(new Error());
    });
  });

  await expect(
    certificateStore.fetchCertificate(onHeadersReceivedDetails)
  ).resolves.not.toThrowError();

  await expect(certificateStore.getErrorMessage(tabId)).toBeInstanceOf(
    ErrorMessage
  );
});
