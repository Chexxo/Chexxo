import { UUIDFactory } from "../../../helpers/UUIDFactory";
import { APIResponseError } from "../../../shared/types/api/APIResponseError";
import { CodedError } from "../../../shared/types/errors/CodedError";
import { ConnectionRefusedError } from "../../../shared/types/errors/ConnectionRefusedError";
import { NoHostError } from "../../../shared/types/errors/NoHostError";
import { ServerError } from "../../../shared/types/errors/ServerError";
import { ExpiredError } from "../../../types/errors/certificate/ExpiredError";
import { InvalidDomainError } from "../../../types/errors/certificate/InvalidDomainError";
import { RevokedError } from "../../../types/errors/certificate/RevokedError";
import { SelfSignedError } from "../../../types/errors/certificate/SelfSignedError";
import { UnknownError } from "../../../types/errors/certificate/UnknownError";
import { UntrustedRootError } from "../../../types/errors/certificate/UntrustedRootError";
import { InvalidResponseErrorFactory } from "../../error/factories/InvalidResponseErrorFactory";

export abstract class ErrorFactory {
  public static fromErrorDto(error: APIResponseError): CodedError {
    const code = error.code;

    switch (code) {
      case 501:
        return new ConnectionRefusedError(error.uuid);
      case 502:
        return InvalidResponseErrorFactory.fromAPIResponseError(error);
      case 503:
        return new NoHostError(error.uuid);
      default:
        return new ServerError(error.uuid);
    }
  }

  public static fromBrowserErrorCode(code: string): Error {
    switch (code) {
      case "Error code 2153390067":
      case "net::ERR_CERT_AUTHORITY_INVALID":
        return new UntrustedRootError(UUIDFactory.uuidv4());

      case "Error code 2153398258":
        return new SelfSignedError(UUIDFactory.uuidv4());

      case "Error code 2153390069":
      case "net::ERR_CERT_DATE_INVALID":
        return new ExpiredError(UUIDFactory.uuidv4());

      case "Error code 2153394164":
      case "net::ERR_CERT_COMMON_NAME_INVALID":
        return new InvalidDomainError(UUIDFactory.uuidv4());

      case "Error code 2153390068":
      case "net::ERR_CERT_REVOKED":
        return new RevokedError(UUIDFactory.uuidv4());

      default:
        return new UnknownError(UUIDFactory.uuidv4());
    }
  }
}
