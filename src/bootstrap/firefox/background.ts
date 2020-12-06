import { browser } from "webextension-polyfill-ts";

import { App } from "../../background/App";
import { CertificateService } from "../../background/certificate/CertificateService";
import { InBrowserProvider } from "../../background/certificate/providers/InBrowserProvider";
import { EventManager } from "../../background/EventManager";
import { InBrowserLogger } from "../../background/logger/InBrowserLogger";
import { InBrowserPersistenceManager } from "../../background/logger/InBrowserPersistenceManager";
import { QualityProvider } from "../../background/quality/providers/QualityProvider";
import { QualityService } from "../../background/quality/QualityService";
import { Configurator } from "../../helpers/Configurator";

const certificateProvider = new InBrowserProvider(
  browser.webRequest.getSecurityInfo
);
const certificateService = new CertificateService(certificateProvider);
const qualityProvider = new QualityProvider(browser.storage.local);
const qualityService = new QualityService(qualityProvider);
const configurator = new Configurator(browser.storage);
const logger = new InBrowserLogger(
  new InBrowserPersistenceManager(browser.storage.local)
);

const app = new App(certificateService, qualityService, configurator, logger);

app.init();

const eventManager = new EventManager(
  browser.webNavigation,
  browser.runtime,
  browser.tabs,
  browser.browserAction,
  app,
  browser.webRequest
);

eventManager.init();
