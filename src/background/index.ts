import { browser } from "webextension-polyfill-ts";

import EventManager from "./EventManager";
import App from "./App";
import InBrowserProvider from "./certificate/providers/InBrowserProvider";
import CertificateService from "./certificate/CertificateService";
import QualityProvider from "./quality/providers/QualityProvider";
import QualityService from "./quality/QualityService";
import Configurator from "../helpers/Configurator";

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
