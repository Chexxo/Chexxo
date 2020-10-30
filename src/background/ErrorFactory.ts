import ExpiredError from "../types/CommonTypes/errors/certificate/ExpiredError";
import InvalidDomainError from "../types/CommonTypes/errors/certificate/InvalidDomainError";
import SelfSignedError from "../types/CommonTypes/errors/certificate/SelfSignedError";
import UntrustedRootError from "../types/CommonTypes/errors/certificate/UntrustedRootError";
import CodedError from "../types/CommonTypes/errors/CodedError";
import InvalidResponseError from "../types/CommonTypes/errors/InvalidResponseError";
import NoHostError from "../types/CommonTypes/errors/NoHostError";
import ServerError from "../types/CommonTypes/errors/ServerError";

export default class ErrorFactory {
  public static fromErrorDto(error: unknown): CodedError {
    const codedError = error as CodedError;
    const { code, stack } = codedError;

    switch (code) {
      case 101:
        return new ExpiredError(stack);
      case 102:
        return new InvalidDomainError(stack);
      case 103:
        return new SelfSignedError(stack);
      case 104:
        return new UntrustedRootError(stack);
      case 200:
        return new InvalidResponseError(0, stack);
      case 300:
        return new NoHostError(stack);
      default:
        return new ServerError(codedError);
    }
  }
}
