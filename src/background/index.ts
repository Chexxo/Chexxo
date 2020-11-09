import { browser } from "webextension-polyfill-ts";

import App from "./App";
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

const app = new App(
  onHeadersReceived,
  onMessage,
  onActivated,
  setIcon,
  setBadgeText,
  setBadgeBackgroundColor,
  certificateStore
);

app.init();
