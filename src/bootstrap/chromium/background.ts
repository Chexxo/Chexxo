import { browser } from "webextension-polyfill-ts";

import { App } from "../../background/App";
import { CertificateService } from "../../background/certificate/CertificateService";
import { ServerProvider } from "../../background/certificate/providers/ServerProvider";
import { EventManager } from "../../background/EventManager";
import { InBrowserLogger } from "../../background/logger/InBrowserLogger";
import { InBrowserPersistenceManager } from "../../background/logger/InBrowserPersistenceManager";
import { QualityProvider } from "../../background/quality/providers/QualityProvider";
import { QualityService } from "../../background/quality/QualityService";
import { Configurator } from "../../helpers/Configurator";

const {
  browserAction: { setIcon, setBadgeText, setBadgeBackgroundColor },
  runtime: { onMessage },
  storage,
  tabs: { onActivated },
  webNavigation: { onErrorOccurred },
  webRequest: { onBeforeRequest, onHeadersReceived },
} = browser;

const certificateProvider = new ServerProvider();
const certificateService = new CertificateService(certificateProvider);
const qualityProvider = new QualityProvider();
const qualityService = new QualityService(qualityProvider);
const configurator = new Configurator(storage);
const logger = new InBrowserLogger(
  new InBrowserPersistenceManager(storage.local)
);

const app = new App(certificateService, qualityService, configurator, logger);

app.init();

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
