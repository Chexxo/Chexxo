import { APIResponseError } from "../../../shared/types/api/APIResponseError";
import { InvalidResponseErrorFactory } from "./InvalidResponseErrorFactory";

let error: APIResponseError;
beforeEach(() => {
  error = new APIResponseError(
    502,
    "Server responded with unsupported statuscode. Status: 302"
  );
});

test("returns correct status code from error", () => {
  const result = InvalidResponseErrorFactory.fromAPIResponseError(error);
  expect(result.statusCode).toBe(302);
});

test("returns as status code if no status code could be detected.", () => {
  error = new APIResponseError(
    502,
    "Server responded with unsupported statuscode. Status: Hello"
  );
  const result = InvalidResponseErrorFactory.fromAPIResponseError(error);
  expect(result.statusCode).toBe(0);
});

test("returns 0 as status code if different error provided.", () => {
  error = new APIResponseError(500, "An internal server error occured.");
  const result = InvalidResponseErrorFactory.fromAPIResponseError(error);
  expect(result.statusCode).toBe(0);
});
