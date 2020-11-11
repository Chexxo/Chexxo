// import browserMock from "webextensions-api-mock";
import { deepMock } from "mockzilla";
import { Browser, WebRequest } from "webextension-polyfill-ts";

import InBrowserProvider from "./InBrowserProvider";
import InsecureConnectionError from "../../../types/errors/InsecureConnectionError";
import Certificate from "../../../types/certificate/Certificate";
import Issuer from "../../../types/certificate/Issuer";
import Subject from "../../../types/certificate/Subject";

const [browser, mockBrowser] = deepMock<Browser>("browser", false);

let requestId: string;
let onHeadersReceivedDetails: WebRequest.OnHeadersReceivedDetailsType;
let getSecurityInfoOptions: WebRequest.GetSecurityInfoOptionsType;
let securityInfo: WebRequest.SecurityInfo;
let certificate: Certificate;

beforeEach(() => {
  requestId = "1";

  onHeadersReceivedDetails = {
    requestId,
    url: "https://example.com/",
    method: "GET",
    frameId: 0,
    parentFrameId: -1,
    tabId: 1,
    type: "main_frame",
    timeStamp: 0,
    statusLine: "HTTP/2.0 200 OK",
    statusCode: 200,
    thirdParty: false,
  };

  getSecurityInfoOptions = {
    certificateChain: false,
    rawDER: false,
  };

  securityInfo = {
    state: "secure",
    certificates: [
      {
        subject: "CN=example.com",
        issuer: "CN=Example",
        validity: { start: 0, end: 0 },
        fingerprint: {
          sha1: "0C:AA:F2:4A:B1:A0:C3:34:40:C0:6A:FE:99:DF:98:63:65:B0:78:1F",
          sha256:
            "a3:79:a6:f6:ee:af:b9:a5:5e:37:8c:11:80:34:e2:75:1e:68:2f:ab:9f:2d:30:ab:13:d2:12:55:86:ce:19:47",
        },
        serialNumber: "0",
        isBuiltInRoot: false,
        subjectPublicKeyInfoDigest: { sha256: "" },
      },
    ],
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

test("returns the certificate when securityInfo is secure", async () => {
  mockBrowser.webRequest.getSecurityInfo
    .expect(requestId, getSecurityInfoOptions)
    .andResolve(securityInfo);

  const inBrowserProvider = new InBrowserProvider(
    browser.webRequest.getSecurityInfo
  );

  await expect(
    inBrowserProvider.getCertificate(onHeadersReceivedDetails)
  ).resolves.toEqual(certificate);
});

test("throws an InsecureConnectionError when securityInfo is insecure", async () => {
  securityInfo.state = "insecure";

  mockBrowser.webRequest.getSecurityInfo
    .expect(requestId, getSecurityInfoOptions)
    .andResolve(securityInfo);

  const inBrowserProvider = new InBrowserProvider(
    browser.webRequest.getSecurityInfo
  );

  await expect(
    inBrowserProvider.getCertificate(onHeadersReceivedDetails)
  ).rejects.toThrowError(InsecureConnectionError);
});
