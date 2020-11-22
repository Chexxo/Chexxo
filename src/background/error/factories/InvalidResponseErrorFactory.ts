import InvalidResponseError from "../../../types/CommonTypes/errors/InvalidResponseError";

export default abstract class InvalidResponseErrorFactory {
  static fromPublicMessage(message: string): InvalidResponseError {
    const split = message.split("Status:");
    if (!split[1] || isNaN(parseInt(split[1]))) {
      return new InvalidResponseError(0);
    }
    return new InvalidResponseError(parseInt(split[1]));
  }
}
