import { browser } from "webextension-polyfill-ts";

import App from "./App";
import CertificateAnalyzer from "./providers/CertificateAnalyzer";
import CertificateStore from "./stores/CertificateStore";
import InBrowserProvider from "./providers/InBrowserProvider";

const {
  browserAction: { setIcon, setBadgeText, setBadgeBackgroundColor },
  runtime: { onMessage },
  tabs: { onActivated },
  webRequest: { onHeadersReceived, getSecurityInfo },
} = browser;

const certificateProvider = new InBrowserProvider(getSecurityInfo);
const certificateAnalyzer = new CertificateAnalyzer();
const certificateStore = new CertificateStore(
  certificateProvider,
  certificateAnalyzer
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
