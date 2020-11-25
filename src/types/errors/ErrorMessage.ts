export class ErrorMessage {
  constructor(readonly message: string) {}

  public static fromError(error: Error): ErrorMessage {
    return new ErrorMessage(error.message);
  }
}
