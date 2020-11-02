// import browserMock from "webextensions-api-mock";
import { deepMock } from "mockzilla";
import { Browser } from "webextension-polyfill-ts";

import {
  requestId,
  onHeadersReceivedDetails,
  getSecurityInfoOptions,
  securityInfo,
  certificate,
} from "../__mocks__/Defaults";
import InBrowserProvider from "./InBrowserProvider";
import InsecureConnectionError from "../../types/errors/InsecureConnectionError";

describe("InBrowserProvider", () => {
  const [browser, mockBrowser] = deepMock<Browser>("browser", false);

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
});
