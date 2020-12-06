import { APIResponseError } from "../../../shared/types/api/APIResponseError";
import { CodedError } from "../../../shared/types/errors/CodedError";
import { ConnectionRefusedError } from "../../../shared/types/errors/ConnectionRefusedError";
import { HostUnreachableError } from "../../../shared/types/errors/HostUnreachableError";
import { InvalidUrlError } from "../../../shared/types/errors/InvalidUrlError";
import { NoHostError } from "../../../shared/types/errors/NoHostError";
import { ServerError } from "../../../shared/types/errors/ServerError";
import { ExpiredError } from "../../../types/errors/certificate/ExpiredError";
import { InvalidDomainError } from "../../../types/errors/certificate/InvalidDomainError";
import { RevokedError } from "../../../types/errors/certificate/RevokedError";
import { SelfSignedError } from "../../../types/errors/certificate/SelfSignedError";
import { UnknownCertificateError } from "../../../types/errors/certificate/UnknownCertificateError";
import { UntrustedRootError } from "../../../types/errors/certificate/UntrustedRootError";
import { InvalidResponseErrorFactory } from "../../error/factories/InvalidResponseErrorFactory";

export abstract class ErrorFactory {
  public static fromErrorDto(error: APIResponseError): CodedError {
    const code = error.code;

    switch (code) {
      case 501:
        return new ConnectionRefusedError();
      case 502:
        return InvalidResponseErrorFactory.fromAPIResponseError(error);
      case 503:
        return new NoHostError();
      case 504:
        return new HostUnreachableError();
      case 505:
        return new InvalidUrlError(error.publicMessage);
      default:
        const e = new Error(error.publicMessage);
        return new ServerError(e);
    }
  }

  public static fromBrowserErrorCode(code: string): Error {
    switch (code) {
      case "Error code 2153390067":
      case "net::ERR_CERT_AUTHORITY_INVALID":
        return new UntrustedRootError();

      case "Error code 2153398258":
        return new SelfSignedError();

      case "Error code 2153390069":
      case "net::ERR_CERT_DATE_INVALID":
        return new ExpiredError();

      case "Error code 2153394164":
      case "net::ERR_CERT_COMMON_NAME_INVALID":
        return new InvalidDomainError();

      case "Error code 2153390068":
      case "net::ERR_CERT_REVOKED":
        return new RevokedError();

      default:
        return new UnknownCertificateError();
    }
  }
}
