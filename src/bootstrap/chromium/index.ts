import { browser } from "webextension-polyfill-ts";

import EventManager from "../../background/EventManager";
import App from "../../background/App";
import CertificateService from "../../background/certificate/CertificateService";
import QualityProvider from "../../background/quality/providers/QualityProvider";
import QualityService from "../../background/quality/QualityService";
import ServerProvider from "../../background/certificate/providers/ServerProvider";
import Configurator from "../../helpers/Configurator";

const {
  browserAction: { setIcon, setBadgeText, setBadgeBackgroundColor },
  runtime: { onMessage },
  storage,
  tabs: { onActivated },
  webNavigation: { onErrorOccurred },
  webRequest: { onHeadersReceived },
} = browser;

const certificateProvider = new ServerProvider();
const certificateService = new CertificateService(certificateProvider);

const qualityProvider = new QualityProvider();
const qualityService = new QualityService(qualityProvider);

const configurator = new Configurator(storage);
configurator.init();

const app = new App(certificateService, qualityService, configurator);

const eventManager = new EventManager(
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
