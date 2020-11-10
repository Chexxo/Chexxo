import { browser } from "webextension-polyfill-ts";

import EventManager from "./EventManager";
import QualityAnalyzer from "./providers/QualityAnalyzer";
import App from "./stores/App";
import InBrowserProvider from "./providers/InBrowserProvider";

const {
  browserAction: { setIcon, setBadgeText, setBadgeBackgroundColor },
  runtime: { onMessage },
  tabs: { onActivated },
  webRequest: { onHeadersReceived, getSecurityInfo },
} = browser;

const certificateProvider = new InBrowserProvider(getSecurityInfo);
const qualityAnalyzer = new QualityAnalyzer();
const app = new App(certificateProvider, qualityAnalyzer);

const eventManager = new EventManager(
  onHeadersReceived,
  onMessage,
  onActivated,
  setIcon,
  setBadgeText,
  setBadgeBackgroundColor,
  app
);

eventManager.init();
