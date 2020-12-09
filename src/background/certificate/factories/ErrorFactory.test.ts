/* eslint-disable max-lines-per-function */
import { APIResponse } from "../../../shared/types/api/APIResponse";
import { APIResponseError } from "../../../shared/types/api/APIResponseError";
import { ConnectionRefusedError } from "../../../shared/types/errors/ConnectionRefusedError";
import { HostUnreachableError } from "../../../shared/types/errors/HostUnreachableError";
import { InvalidResponseError } from "../../../shared/types/errors/InvalidResponseError";
import { InvalidUrlError } from "../../../shared/types/errors/InvalidUrlError";
import { NoHostError } from "../../../shared/types/errors/NoHostError";
import { ServerError } from "../../../shared/types/errors/ServerError";
import { ExpiredError } from "../../../types/errors/certificate/ExpiredError";
import { InvalidDomainError } from "../../../types/errors/certificate/InvalidDomainError";
import { RevokedError } from "../../../types/errors/certificate/RevokedError";
import { SelfSignedError } from "../../../types/errors/certificate/SelfSignedError";
import { UnknownCertificateError } from "../../../types/errors/certificate/UnknownCertificateError";
import { UntrustedRootError } from "../../../types/errors/certificate/UntrustedRootError";
import { ErrorFactory } from "./ErrorFactory";

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

describe("Mozilla Firefox", () => {
  test("returns UntrustedRootError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("Error code 2153390067")
    ).toBeInstanceOf(UntrustedRootError);
  });

  test("returns SelfSignedError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("Error code 2153398258")
    ).toBeInstanceOf(SelfSignedError);
  });

  test("returns ExpiredError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("Error code 2153390069")
    ).toBeInstanceOf(ExpiredError);
  });

  test("returns InvalidDomainError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("Error code 2153394164")
    ).toBeInstanceOf(InvalidDomainError);
  });

  test("returns RevokedError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("Error code 2153390068")
    ).toBeInstanceOf(RevokedError);
  });
});

describe("Google Chrome", () => {
  test("returns UntrustedRootError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_AUTHORITY_INVALID")
    ).toBeInstanceOf(UntrustedRootError);
  });

  test("returns ExpiredError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_DATE_INVALID")
    ).toBeInstanceOf(ExpiredError);
  });

  test("returns InvalidDomainError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_COMMON_NAME_INVALID")
    ).toBeInstanceOf(InvalidDomainError);
  });

  test("returns RevokedError when the corresponding code is provided", () => {
    expect(
      ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_REVOKED")
    ).toBeInstanceOf(RevokedError);
  });
});

test("returns UnknownError when an unhandled code is provided", () => {
  expect(ErrorFactory.fromBrowserErrorCode("")).toBeInstanceOf(
    UnknownCertificateError
  );
});

describe("fromErrorDto", () => {
  test("returns connection refused error", () => {
    const error = new APIResponseError(501, "Test");
    expect(ErrorFactory.fromErrorDto(error)).toBeInstanceOf(
      ConnectionRefusedError
    );
  });

  test("returns invalid response error", () => {
    const error = new APIResponseError(502, "Test");
    expect(ErrorFactory.fromErrorDto(error)).toBeInstanceOf(
      InvalidResponseError
    );
  });

  test("returns no host error", () => {
    const error = new APIResponseError(503, "Test");
    expect(ErrorFactory.fromErrorDto(error)).toBeInstanceOf(NoHostError);
  });

  test("returns host unreachable error", () => {
    const error = new APIResponseError(504, "Test");
    expect(ErrorFactory.fromErrorDto(error)).toBeInstanceOf(
      HostUnreachableError
    );
  });

  test("returns invalid url error", () => {
    const error = new APIResponseError(505, "Test");
    expect(ErrorFactory.fromErrorDto(error)).toBeInstanceOf(InvalidUrlError);
  });

  test("returns server error", () => {
    const error = new APIResponseError(500, "Test");
    expect(ErrorFactory.fromErrorDto(error)).toBeInstanceOf(ServerError);
  });

  test("returns server error on unknown code", () => {
    const error = new APIResponseError(0, "Test");
    expect(ErrorFactory.fromErrorDto(error)).toBeInstanceOf(ServerError);
  });
});
