import { deepMock, MockzillaDeep } from "mockzilla";
import { Browser } from "webextension-polyfill-ts";
import { StorageError } from "../../../types/errors/StorageError";
import { Quality } from "../../../types/Quality";
import { QualityProvider } from "./QualityProvider";

let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let qualityProvider: QualityProvider;

beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  mockBrowser.storage.local.mockAllow();

  qualityProvider = new QualityProvider(browser.storage.local);
});

test("strips everything off url, except from domain", () => {
  expect(
    qualityProvider["stripUrl"]("https://www.example.com/search?key=example")
  ).toEqual("www.example.com");
});

test("returns quality for url, if domain is cached", async () => {
  mockBrowser.storage.local.get
    .expect(["qualities"])
    .andResolve({ qualities: { "www.example.com": Quality.DomainValidated } });

  await expect(
    qualityProvider["getQuality"]("https://www.example.com")
  ).resolves.toEqual(Quality.DomainValidated);
});

test("returns unknown quality for url, if domain is not cached", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({});

  await expect(
    qualityProvider["getQuality"]("https://www.example.com")
  ).resolves.toEqual(Quality.Unknown);
});

test("throws StorageError, if storage get operation fails", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andReject(new Error());

  await expect(
    qualityProvider["getQuality"]("https://www.example.com")
  ).rejects.toBeInstanceOf(StorageError);
});

test("sets quality for provided url, if quality is stored already", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({
    qualities: { "www.example.com": Quality.OrganizationValidated },
  });
  mockBrowser.storage.local.set
    .expect({ qualities: { "www.example.com": Quality.DomainValidated } })
    .andResolve();

  await expect(
    qualityProvider.defineQuality(
      "https://www.example.com",
      Quality.DomainValidated
    )
  ).resolves.toEqual(undefined);
});

test("sets quality for provided url, if quality is not stored already", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({});
  mockBrowser.storage.local.set
    .expect({ qualities: { "www.example.com": Quality.DomainValidated } })
    .andResolve();

  await expect(
    qualityProvider.defineQuality(
      "https://www.example.com",
      Quality.DomainValidated
    )
  ).resolves.toEqual(undefined);
});

test("throws Storage, if storage set operation fails", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({});
  mockBrowser.storage.local.set
    .expect({ qualities: { "www.example.com": Quality.DomainValidated } })
    .andReject(new Error());

  await expect(
    qualityProvider.defineQuality(
      "https://www.example.com",
      Quality.DomainValidated
    )
  ).rejects.toBeInstanceOf(StorageError);
});

test("returns true, if provided quality is lower than stored quality", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({
    qualities: { "www.example.com": Quality.ExtendedValidated },
  });

  await expect(
    qualityProvider.hasQualityDecreased(
      "https://www.example.com",
      Quality.DomainValidated
    )
  ).resolves.toEqual(true);
});

test("returns false, if provided quality is higher than stored quality", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({
    qualities: { "www.example.com": Quality.DomainValidated },
  });

  await expect(
    qualityProvider.hasQualityDecreased(
      "https://www.example.com",
      Quality.OrganizationValidated
    )
  ).resolves.toEqual(false);
});

test("returns false, if provided quality is equal with stored quality", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({
    qualities: { "www.example.com": Quality.DomainValidated },
  });

  await expect(
    qualityProvider.hasQualityDecreased(
      "https://www.example.com",
      Quality.DomainValidated
    )
  ).resolves.toEqual(false);
});

test("resets quality of provided url to unknown", async () => {
  mockBrowser.storage.local.get.expect(["qualities"]).andResolve({});
  mockBrowser.storage.local.set
    .expect({
      qualities: { "www.example.com": Quality.Unknown },
    })
    .andResolve();

  await expect(
    qualityProvider.resetQuality("https://www.example.com")
  ).resolves.toEqual(undefined);
});
