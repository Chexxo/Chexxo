// import browserMock from "webextensions-api-mock";
import { deepMock } from "mockzilla";
import { Browser, WebRequest } from "webextension-polyfill-ts";

import { InsecureConnectionError } from "../../../types/errors/InsecureConnectionError";
import { InBrowserProvider } from "./InBrowserProvider";

const [browser, mockBrowser] = deepMock<Browser>("browser", false);

let requestId: string;
let onHeadersReceivedDetails: WebRequest.OnHeadersReceivedDetailsType;
let getSecurityInfoOptions: WebRequest.GetSecurityInfoOptionsType;
let securityInfo: WebRequest.SecurityInfo;

let windowSpy = jest.spyOn(window, "window", "get");

// eslint-disable-next-line max-lines-per-function
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
});

afterEach(() => {
  windowSpy.mockRestore();
});

test("returns the raw certificate when securityInfo is secure", async () => {
  mockBrowser.webRequest.getSecurityInfo
    .expect(requestId, getSecurityInfoOptions)
    .andResolve(securityInfo);

  const inBrowserProvider = new InBrowserProvider(
    browser.webRequest.getSecurityInfo
  );
  const certificateResponse = await inBrowserProvider.getCertificate(
    onHeadersReceivedDetails
  );

  expect(certificateResponse.rawCertificate).not.toBe(undefined);
});

test("returns an error when securityInfo is insecure", () => {
  securityInfo.state = "insecure";

  mockBrowser.webRequest.getSecurityInfo
    .expect(requestId, getSecurityInfoOptions)
    .andResolve(securityInfo);

  const inBrowserProvider = new InBrowserProvider(
    browser.webRequest.getSecurityInfo
  );

  return expect(
    inBrowserProvider.getCertificate(onHeadersReceivedDetails)
  ).rejects.toHaveProperty("error.constructor", InsecureConnectionError);
});
