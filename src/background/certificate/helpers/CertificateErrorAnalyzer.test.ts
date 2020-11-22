import CertificateError from "../../../types/errors/certificate/CertificateError";
import CertificateErrorAnalyzer from "./CertificateErrorAnalyzer";

test("returns CertificateError when a handled error code is provided", () => {
  const requestDetails = {
    url: "",
    frameId: 0,
    error: "Error code 2153390067",
  };
  expect(CertificateErrorAnalyzer.analyzeError(requestDetails)).toBeInstanceOf(
    CertificateError
  );
});

test("returns undefined a non main-frame frameId is provided", () => {
  const requestDetails = {
    url: "",
    frameId: 1,
    error: "Error code 2153390067",
  };
  expect(CertificateErrorAnalyzer.analyzeError(requestDetails)).toBeNull();
});
