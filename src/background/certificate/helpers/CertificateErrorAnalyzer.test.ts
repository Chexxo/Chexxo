import { CertificateError } from "../../../types/errors/certificate/CertificateError";
import { CertificateErrorAnalyzer } from "./CertificateErrorAnalyzer";

let windowSpy = jest.spyOn(window, "window", "get");
beforeEach(() => {
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

test("returns CertificateError if a handled error code is provided", () => {
  const requestDetails = {
    url: "",
    frameId: 0,
    error: "Error code 2153390067",
  };
  expect(CertificateErrorAnalyzer.analyzeError(requestDetails)).toBeInstanceOf(
    CertificateError
  );
});

test("returns undefined if a non main-frame frameId is provided", () => {
  const requestDetails = {
    url: "",
    frameId: 1,
    error: "Error code 2153390067",
  };
  expect(CertificateErrorAnalyzer.analyzeError(requestDetails)).toBeNull();
});
