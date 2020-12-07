import { Quality } from "../../types/Quality";
import { QualityAnalyzer } from "./helpers/QualityAnalyzer";
import { QualityProvider } from "./providers/QualityProvider";
import { QualityService } from "./QualityService";

let qualityService: QualityService;
let qualityProvider: QualityProvider;

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityProvider = <any>{
    updateIsCacheActive: jest.fn(),
    hasQualityDecreased: jest.fn(),
    defineQuality: jest.fn(),
    resetQuality: jest.fn(),
    removeQualities: jest.fn(),
  };
  qualityService = new QualityService(qualityProvider);
});

test("calls correct methods on configuration update", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityService.updateConfiguration(<any>{ cacheDomainQualities: true });
  expect(qualityProvider.updateIsCacheActive).toHaveBeenLastCalledWith(true);
});

test("returns quality from quality analyzer", () => {
  QualityAnalyzer.getQuality = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityService.getQuality(<any>{});
  expect(QualityAnalyzer.getQuality).toHaveBeenCalled();
});

test("proxies hasQualityDecreased to quality provider", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityService.hasQualityDecreased("", Quality.Unknown);
  expect(qualityProvider.hasQualityDecreased).toHaveBeenCalled();
});

test("proxies defineQuality to quality provider", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityService.defineQuality("", Quality.Unknown);
  expect(qualityProvider.defineQuality).toHaveBeenCalled();
});

test("proxies resetQuality to quality provider", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityService.resetQuality("");
  expect(qualityProvider.resetQuality).toHaveBeenCalled();
});

test("proxies removeQualities to quality provider", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityService.removeQualities();
  expect(qualityProvider.removeQualities).toHaveBeenCalled();
});
