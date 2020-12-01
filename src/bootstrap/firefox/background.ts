import { browser } from "webextension-polyfill-ts";

import { App } from "../../background/App";
import { CertificateService } from "../../background/certificate/CertificateService";
import { InBrowserProvider } from "../../background/certificate/providers/InBrowserProvider";
import { EventManager } from "../../background/EventManager";
import { QualityProvider } from "../../background/quality/providers/QualityProvider";
import { QualityService } from "../../background/quality/QualityService";

const certificateProvider = new InBrowserProvider(
  browser.webRequest.getSecurityInfo
);
const certificateService = new CertificateService(certificateProvider);
const qualityProvider = new QualityProvider(browser.storage.local);
const qualityService = new QualityService(qualityProvider);
const app = new App(certificateService, qualityService);

const eventManager = new EventManager(
  browser.webRequest,
  browser.webNavigation,
  browser.runtime,
  browser.tabs,
  browser.browserAction,
  app
);

eventManager.init();
