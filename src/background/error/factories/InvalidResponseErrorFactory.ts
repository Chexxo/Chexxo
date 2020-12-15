import { APIResponseError } from "../../../shared/types/api/APIResponseError";
import { InvalidResponseError } from "../../../shared/types/errors/InvalidResponseError";

/**
 * Class which provides helper functionality regarding
 * {@link InvalidResponseError}.
 */
export abstract class InvalidResponseErrorFactory {
  /**
   * Converts a given {@link APIResponseError} into
   * a {@link InvalidResponseError}.
   *
   * @param error the error which should be converted.
   */
  public static fromAPIResponseError(
    error: APIResponseError
  ): InvalidResponseError {
    const split = error.publicMessage.split("Status:");
    if (!split[1] || isNaN(parseInt(split[1]))) {
      return new InvalidResponseError(0);
    }
    return new InvalidResponseError(parseInt(split[1]));
  }
}
