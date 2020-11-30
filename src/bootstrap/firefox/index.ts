import { browser } from "webextension-polyfill-ts";

import { App } from "../../background/App";
import { CertificateService } from "../../background/certificate/CertificateService";
import { InBrowserProvider } from "../../background/certificate/providers/InBrowserProvider";
import { EventManager } from "../../background/EventManager";
import { QualityProvider } from "../../background/quality/providers/QualityProvider";
import { QualityService } from "../../background/quality/QualityService";

const {
  browserAction: { setIcon, setBadgeText, setBadgeBackgroundColor },
  runtime: { onMessage },
  storage: { local },
  tabs: { onActivated },
  webNavigation: { onErrorOccurred },
  webRequest: { onBeforeRequest, onHeadersReceived, getSecurityInfo },
} = browser;

const certificateProvider = new InBrowserProvider(getSecurityInfo);
const certificateService = new CertificateService(certificateProvider);
const qualityProvider = new QualityProvider(local);
const qualityService = new QualityService(qualityProvider);
const app = new App(certificateService, qualityService);

const eventManager = new EventManager(
  onBeforeRequest,
  onHeadersReceived,
  onErrorOccurred,
  onMessage,
  onActivated,
  setIcon,
  setBadgeText,
  setBadgeBackgroundColor,
  app
);

eventManager.init();
