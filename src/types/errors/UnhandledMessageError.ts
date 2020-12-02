import { CodedError } from "../../shared/types/errors/CodedError";

export class UnhandledMessageError extends CodedError {
  readonly code: number = 803;
  readonly name: string = "UnhandledMessageError";
  readonly message: string = "The provided message type has no handler";
  readonly publicMessage: string = this.message;

  constructor(readonly trace?: string) {
    super();
  }
}
