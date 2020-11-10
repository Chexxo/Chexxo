import ExpiredError from "../../../types/CommonTypes/errors/certificate/ExpiredError";
import InvalidDomainError from "../../../types/CommonTypes/errors/certificate/InvalidDomainError";
import SelfSignedError from "../../../types/CommonTypes/errors/certificate/SelfSignedError";
import UntrustedRootError from "../../../types/CommonTypes/errors/certificate/UntrustedRootError";
import CodedError from "../../../types/CommonTypes/errors/CodedError";
import ConnectionRefusedError from "../../../types/CommonTypes/errors/ConnectionRefusedError";
import InvalidResponseError from "../../../types/CommonTypes/errors/InvalidResponseError";
import NoHostError from "../../../types/CommonTypes/errors/NoHostError";
import ServerError from "../../../types/CommonTypes/errors/ServerError";

export default class ErrorFactory {
  public static fromErrorDto(error: unknown): CodedError {
    const codedError = error as CodedError;
    const { code } = codedError;

    switch (code) {
      case 101:
        return new ExpiredError();
      case 102:
        return new InvalidDomainError();
      case 103:
        return new SelfSignedError();
      case 104:
        return new UntrustedRootError();
      case 200:
        return new InvalidResponseError(0);
      case 300:
        return new NoHostError();
      case 400:
        return new ConnectionRefusedError();
      default:
        return new ServerError(codedError);
    }
  }
}
