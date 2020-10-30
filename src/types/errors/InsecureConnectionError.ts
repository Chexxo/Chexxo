export default class InsecureConnectionError extends Error {
  readonly name: string = "InsecureConnectionError";
  readonly message: string = "Server responded with an insecure connection.";
}
