import { browser } from "webextension-polyfill-ts";

import App from "./App";
import CertificateAnalyzer from "./CertificateAnalyzer";
import CertificateService from "./CertificateService";
import InBrowserProvider from "./providers/InBrowserProvider";

const {
  webRequest: { onHeadersReceived, getSecurityInfo },
  runtime: { onMessage },
} = browser;

const certificateProvider = new InBrowserProvider(getSecurityInfo);
const certificateAnalyzer = new CertificateAnalyzer();
const certificateService = new CertificateService(
  certificateProvider,
  certificateAnalyzer
);

const app = new App(onHeadersReceived, onMessage, certificateService);

app.init();
