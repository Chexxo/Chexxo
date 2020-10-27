import { browser } from "webextension-polyfill-ts";

import App from "./App";
import CertificateService from "./CertificateService";
import InBrowserProvider from "./InBrowserProvider";

const {
  webRequest: { onHeadersReceived, getSecurityInfo },
  runtime: { onMessage },
} = browser;

const certificateProvider = new InBrowserProvider(getSecurityInfo);
const certificateService = new CertificateService(certificateProvider);

const app = new App(onHeadersReceived, onMessage, certificateService);

app.init();
