// import browserMock from "webextensions-api-mock";
import { deepMock } from "mockzilla";
import { Browser, WebRequest } from "webextension-polyfill-ts";

import InBrowserProvider from "./InBrowserProvider";
import InsecureConnectionError from "../../../types/errors/InsecureConnectionError";

const [browser, mockBrowser] = deepMock<Browser>("browser", false);

let requestId: string;
let onHeadersReceivedDetails: WebRequest.OnHeadersReceivedDetailsType;
let getSecurityInfoOptions: WebRequest.GetSecurityInfoOptionsType;
let securityInfo: WebRequest.SecurityInfo;

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
    rawDER: true,
  };

  securityInfo = {
    state: "secure",
    certificates: [
      {
        subject: "",
        issuer: "",
        validity: { start: 0, end: 0 },
        fingerprint: {
          sha1: "",
          sha256: "",
        },
        serialNumber: "0",
        isBuiltInRoot: false,
        subjectPublicKeyInfoDigest: { sha256: "" },
        rawDER: [1],
      },
    ],
  };
});

test("returns the raw certificate when securityInfo is secure", async () => {
  mockBrowser.webRequest.getSecurityInfo
    .expect(requestId, getSecurityInfoOptions)
    .andResolve(securityInfo);

  const inBrowserProvider = new InBrowserProvider(
    browser.webRequest.getSecurityInfo
  );
  const certificate = await inBrowserProvider.getCertificate(
    onHeadersReceivedDetails
  );

  expect(certificate.pem.length).toBeGreaterThan(0);
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
