import ExpiredError from "../../../types/errors/certificate/ExpiredError";
import InvalidDomainError from "../../../types/errors/certificate/InvalidDomainError";
import SelfSignedError from "../../../types/errors/certificate/SelfSignedError";
import UntrustedRootError from "../../../types/errors/certificate/UntrustedRootError";
import CodedError from "../../../types/CommonTypes/errors/CodedError";
import ConnectionRefusedError from "../../../types/CommonTypes/errors/ConnectionRefusedError";
import InvalidResponseError from "../../../types/CommonTypes/errors/InvalidResponseError";
import NoHostError from "../../../types/CommonTypes/errors/NoHostError";
import ServerError from "../../../types/CommonTypes/errors/ServerError";
import APIResponseError from "../../../types/CommonTypes/api/APIResponseError";

export default class ErrorFactory {
  public static fromErrorDto(error: APIResponseError): CodedError {
    const code = error.code;

    switch (code) {
      case 101:
        return new ExpiredError();
      case 102:
        return new InvalidDomainError();
      case 103:
        return new SelfSignedError();
      case 104:
        return new UntrustedRootError();
      case 501:
        return new ConnectionRefusedError();
      case 502:
        return new InvalidResponseError(0);
      case 503:
        return new NoHostError();
      default:
        return new ServerError(new Error(error.publicMessage));
    }
  }
}