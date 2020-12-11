import { RawCertificate } from "../../shared/types/certificate/RawCertificate";
import { ServerError } from "../../shared/types/errors/ServerError";
import { Certificate } from "../../types/certificate/Certificate";
import { CertificateResponse } from "../../types/certificate/CertificateResponse";
import { Issuer } from "../../types/certificate/Issuer";
import { RawCertificateResponse } from "../../types/certificate/RawCertificateResponse";
import { Subject } from "../../types/certificate/Subject";
import { CertificateService } from "./CertificateService";
import { CertificateErrorAnalyzer } from "./helpers/CertificateErrorAnalyzer";
import { CertificateParser } from "./helpers/CertificateParser";
import { CertificateProvider } from "./providers/CertificateProvider";
import { InBrowserProvider } from "./providers/InBrowserProvider";
import { ServerProvider } from "./providers/ServerProvider";

let certificateService: CertificateService;
let certificateProvider: CertificateProvider;

let windowSpy = jest.spyOn(window, "window", "get");

beforeEach(() => {
  certificateProvider = new InBrowserProvider(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <any>{};
  });
  certificateService = new CertificateService(certificateProvider);

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

test("updates provider configuration if server provider", () => {
  const tempCertificateProvider = new ServerProvider();
  tempCertificateProvider["updateServerUrl"] = jest.fn();
  certificateService = new CertificateService(tempCertificateProvider);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  certificateService.updateConfiguration(<any>{});
  expect(tempCertificateProvider["updateServerUrl"]).toHaveBeenCalled();
});

test("does not update provider configuration if in browser provider", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(() => {
    certificateService.updateConfiguration(<any>{});
  }).not.toThrow();
});

test("proxies analyzeError", () => {
  CertificateErrorAnalyzer.analyzeError = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  certificateService.analyzeError(<any>{});
  expect(CertificateErrorAnalyzer.analyzeError).toHaveBeenCalled();
});

test("throws certificate response if certificate undefined", () => {
  certificateProvider.getCertificate = jest.fn(async () => {
    return new RawCertificateResponse("", undefined, new ServerError());
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return certificateService.getCertificate(<any>{}).catch((error) => {
    expect(error).toBeInstanceOf(CertificateResponse);
  });
});

test("throws certificate response on certificate parser error", () => {
  certificateProvider.getCertificate = jest.fn(async () => {
    return new RawCertificateResponse("", new RawCertificate(""), undefined);
  });
  CertificateParser.getCertificate = jest.fn(() => {
    throw new Error();
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return certificateService.getCertificate(<any>{}).catch((error) => {
    expect(CertificateParser.getCertificate).toHaveBeenCalled();
    expect(error).toBeInstanceOf(CertificateResponse);
  });
});

test("sunny case", () => {
  certificateProvider.getCertificate = jest.fn(async () => {
    return new RawCertificateResponse("", new RawCertificate(""), undefined);
  });
  CertificateParser.getCertificate = jest.fn(() => {
    return new Certificate(
      "",
      "",
      new Issuer("", "", "", "", "", ""),
      "",
      new Subject("", "", "", "", "", ""),
      [],
      10,
      12,
      []
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return certificateService.getCertificate(<any>{}).then((data) => {
    expect(data).toBeInstanceOf(CertificateResponse);
  });
});
