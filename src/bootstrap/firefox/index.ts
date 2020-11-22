import { browser } from "webextension-polyfill-ts";

import Configurator from "../../helpers/Configurator";
import EventManager from "../../background/EventManager";
import App from "../../background/App";
import InBrowserProvider from "../../background/certificate/providers/InBrowserProvider";
import CertificateService from "../../background/certificate/CertificateService";
import QualityProvider from "../../background/quality/providers/QualityProvider";
import QualityService from "../../background/quality/QualityService";

const {
  browserAction: { setIcon, setBadgeText, setBadgeBackgroundColor },
  runtime: { onMessage },
  storage,
  tabs: { onActivated },
  webNavigation: { onErrorOccurred },
  webRequest: { onHeadersReceived, getSecurityInfo },
} = browser;

const certificateProvider = new InBrowserProvider(getSecurityInfo);
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
