/**
 * Class representing an error message which is sent
 * from the background to the popup of the extension.
 */
export class ErrorMessage {
  constructor(readonly message: string) {}

  public static fromError(error: Error): ErrorMessage {
    return new ErrorMessage(error.message);
  }
}
