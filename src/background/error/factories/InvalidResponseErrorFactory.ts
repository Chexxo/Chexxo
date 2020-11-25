import { APIResponseError } from "../../../shared/types/api/APIResponseError";
import { InvalidResponseError } from "../../../shared/types/errors/InvalidResponseError";

export abstract class InvalidResponseErrorFactory {
  static fromAPIResponseError(error: APIResponseError): InvalidResponseError {
    const split = error.publicMessage.split("Status:");
    if (!split[1] || isNaN(parseInt(split[1]))) {
      return new InvalidResponseError(error.uuid, 0);
    }
    return new InvalidResponseError(error.uuid, parseInt(split[1]));
  }
}
