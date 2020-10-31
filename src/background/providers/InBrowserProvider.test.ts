// import browserMock from "webextensions-api-mock";
import { deepMock } from "mockzilla";
import { Browser, WebRequest } from "webextension-polyfill-ts";

const [browser, mockBrowser] = deepMock<Browser>("browser", false);


describe("InBrowserProvider", () => {
  test("should pass", async () => {
    const requestId = "1";
    const options = { certificateChain: false, rawDER: false };

    const securityInfo: WebRequest.SecurityInfo = {
      state: "secure",
      certificates: [
        {
          subject: "",
          issuer: "",
          validity: { start: 0, end: 0 },
          fingerprint: { sha1: "", sha256: "" },
          serialNumber: "",
          isBuiltInRoot: false,
          subjectPublicKeyInfoDigest: { sha256: "" },
        },
      ],
    };

    mockBrowser.webRequest.getSecurityInfo
      .expect(requestId, options)
      .andResolve(securityInfo);

    expect(await browser.webRequest.getSecurityInfo(requestId, options)).toBe(
      securityInfo
    );
  });
});
