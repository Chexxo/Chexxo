import { browser } from "webextension-polyfill-ts";

import EventManager from "./EventManager";
import QualityAnalyzer from "./providers/QualityAnalyzer";
import CertificateStore from "./stores/CertificateStore";
import InBrowserProvider from "./providers/InBrowserProvider";

const {
  browserAction: { setIcon, setBadgeText, setBadgeBackgroundColor },
  runtime: { onMessage },
  tabs: { onActivated },
  webRequest: { onHeadersReceived, getSecurityInfo },
} = browser;

const certificateProvider = new InBrowserProvider(getSecurityInfo);
const qualityAnalyzer = new QualityAnalyzer();
const certificateStore = new CertificateStore(
  certificateProvider,
  qualityAnalyzer
);

const eventManager = new EventManager(
  onHeadersReceived,
  onMessage,
  onActivated,
  setIcon,
  setBadgeText,
  setBadgeBackgroundColor,
  certificateStore
);

eventManager.init();
