import ExpiredError from "../../../types/errors/certificate/ExpiredError";
import InvalidDomainError from "../../../types/errors/certificate/InvalidDomainError";
import SelfSignedError from "../../../types/errors/certificate/SelfSignedError";
import UntrustedRootError from "../../../types/errors/certificate/UntrustedRootError";
import CodedError from "../../../types/CommonTypes/errors/CodedError";
import ConnectionRefusedError from "../../../types/CommonTypes/errors/ConnectionRefusedError";
import NoHostError from "../../../types/CommonTypes/errors/NoHostError";
import ServerError from "../../../types/CommonTypes/errors/ServerError";
import APIResponseError from "../../../types/CommonTypes/api/APIResponseError";
import RevokedError from "../../../types/errors/certificate/RevokedError";
import UnknownError from "../../../types/errors/certificate/UnknownError";
import InvalidResponseErrorFactory from "../../error/factories/InvalidResponseErrorFactory";

export default abstract class ErrorFactory {
  public static fromErrorDto(error: APIResponseError): CodedError {
    const code = error.code;

    switch (code) {
      case 501:
        return new ConnectionRefusedError();
      case 502:
        return InvalidResponseErrorFactory.fromPublicMessage(
          error.publicMessage
        );
      case 503:
        return new NoHostError();
      default:
        return new ServerError(new Error(error.publicMessage));
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
        return new UnknownError();
    }
  }
}
