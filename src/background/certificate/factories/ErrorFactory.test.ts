import ExpiredError from "../../../types/errors/certificate/ExpiredError";
import InvalidDomainError from "../../../types/errors/certificate/InvalidDomainError";
import RevokedError from "../../../types/errors/certificate/RevokedError";
import SelfSignedError from "../../../types/errors/certificate/SelfSignedError";
import UnknownError from "../../../types/errors/certificate/UnknownError";
import UntrustedRootError from "../../../types/errors/certificate/UntrustedRootError";
import ErrorFactory from "./ErrorFactory";

test("returns UntrustedRootError when the corresponding code is provided", () => {
  expect(
    ErrorFactory.fromBrowserErrorCode("Error code 2153390067")
  ).toBeInstanceOf(UntrustedRootError);
  expect(
    ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_AUTHORITY_INVALID")
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
  expect(
    ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_DATE_INVALID")
  ).toBeInstanceOf(ExpiredError);
});

test("returns InvalidDomainError when the corresponding code is provided", () => {
  expect(
    ErrorFactory.fromBrowserErrorCode("Error code 2153394164")
  ).toBeInstanceOf(InvalidDomainError);
  expect(
    ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_COMMON_NAME_INVALID")
  ).toBeInstanceOf(InvalidDomainError);
});

test("returns RevokedError when the corresponding code is provided", () => {
  expect(
    ErrorFactory.fromBrowserErrorCode("Error code 2153390068")
  ).toBeInstanceOf(RevokedError);
  expect(
    ErrorFactory.fromBrowserErrorCode("net::ERR_CERT_REVOKED")
  ).toBeInstanceOf(RevokedError);
});

test("returns UnknownError when an unhandled code is provided", () => {
  expect(ErrorFactory.fromBrowserErrorCode("")).toBeInstanceOf(UnknownError);
});
