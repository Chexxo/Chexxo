export default class UnhandledMessageError extends Error {
  readonly name: string = "UnhandledMessageError";
  readonly message: string = "The provided message type has no handler";

  constructor(readonly stack?: string) {
    super();
  }
}
