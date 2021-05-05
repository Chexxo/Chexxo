import { APIResponseBody } from "../../../shared/types/api/APIResponseBody";
import { InvalidUrlError } from "../../../shared/types/errors/InvalidUrlError";
import { ServerError } from "../../../shared/types/errors/ServerError";
import { RawCertificateResponse } from "../../../types/certificate/RawCertificateResponse";
import { ServerUnavailableError } from "../../../types/errors/ServerUnavailableError";
import { ServerProvider } from "./ServerProvider";

const fetchSave = global.fetch;
let provider: ServerProvider;
let windowSpy = jest.spyOn(window, "window", "get");

beforeEach(() => {
  provider = new ServerProvider();
  global.fetch = jest.fn();

  windowSpy = jest.spyOn(window, "window", "get");
  windowSpy.mockImplementation(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <any>{
        crypto: {
          getRandomValues: jest.fn(),
        },
      }
  );
});

afterEach(() => {
  windowSpy.mockRestore();
});

afterAll(() => {
  global.fetch = fetchSave;
});

test("adjusts server url according to config", () => {
  const url = "https://localhost:8080";
  provider.updateServerUrl(url);
  expect(provider["serverUrl"]).toBe(url);
});

test("fallback to default url if none defined", () => {
  provider.updateServerUrl();
  expect(provider["serverUrl"]).toBe(ServerProvider["defaultServerUrl"]);
});

test("fetches correct endpoint", () => {
  const url = "https://localhost:8080";
  provider.updateServerUrl(url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider.getCertificate(<any>{
    url: "https://example.com",
  });
  expect(fetch).toHaveBeenLastCalledWith(
    "https://localhost:8080/certificate/example.com"
  );
});

test("throws error if fetch had unexpected error", () => {
  global.fetch = jest.fn(() => {
    return new Promise((resolve, reject) => {
      reject(new Error());
    });
  });
  return expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider.getCertificate(<any>{
      url: "https://example.com",
    })
  ).rejects.toBeInstanceOf(Error);
});

test("returns error if url not correct", () => {
  return expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider.getCertificate(<any>{
      url: "file://example.com",
    })
  ).rejects.toHaveProperty("error.constructor", InvalidUrlError);
});

test("throws specific error if fetch failed", () => {
  global.fetch = jest.fn(() => {
    return new Promise((resolve, reject) => {
      reject(new Error("Failed to fetch"));
    });
  });
  return expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider.getCertificate(<any>{
      url: "https://example.com",
    })
  ).rejects.toBeInstanceOf(ServerUnavailableError);
});

test("cleans url", () => {
  const result = provider["cleanUrl"]("https://example.com/hello?world");
  expect(result).toBe("example.com");
});

test("handles server error", () => {
  global.fetch = jest.fn(() => {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(<any>{
        json: () => {
          return new APIResponseBody("abc123", new ServerError(), null);
        },
      });
    });
  });
  return expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider.getCertificate(<any>{
      url: "https://example.com",
    })
  ).rejects.toHaveProperty("error.constructor", ServerError);
});

test("handles invalid response body", () => {
  global.fetch = jest.fn(() => {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(<any>{
        json: () => {
          return new APIResponseBody("abc123", null, null);
        },
      });
    });
  });
  return expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider.getCertificate(<any>{
      url: "https://example.com",
    })
  ).rejects.toHaveProperty("error.constructor", ServerError);
});

test("sunny case", () => {
  global.fetch = jest.fn(() => {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(<any>{
        json: () => {
          return new APIResponseBody("abc123", null, "123");
        },
      });
    });
  });

  return (
    provider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .getCertificate(<any>{
        url: "https://example.com",
      })
      .then((data: RawCertificateResponse) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(data.rawCertificate!.pem).toBe("123");
      })
  );
});
