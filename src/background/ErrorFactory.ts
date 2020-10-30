import ExpiredError from "../types/CommonTypes/errors/certificate/ExpiredError";
import InvalidDomainError from "../types/CommonTypes/errors/certificate/InvalidDomainError";
import SelfSignedError from "../types/CommonTypes/errors/certificate/SelfSignedError";
import UntrustedRootError from "../types/CommonTypes/errors/certificate/UntrustedRootError";
import InvalidResponseError from "../types/CommonTypes/errors/InvalidResponseError";
import NoHostError from "../types/CommonTypes/errors/NoHostError";

export default class ErrorFactory {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  public static fromErrorDto(error: any): Error {
    switch (error.code) {
      case 1:
        return new SelfSignedError(error.stack);
      case 2:
        return new ExpiredError(error.stack);
      case 3:
        return new InvalidDomainError(error.stack);
      case 4:
        return new UntrustedRootError(error.stack);
      case 5:
        return new InvalidResponseError(0, error.stack);
      case 6:
        return new NoHostError(error.stack);
      default:
        return new Error(error.message);
    }
  }
}