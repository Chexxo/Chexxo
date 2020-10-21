import { browser } from "webextension-polyfill-ts";

import App from "./App";
import CertificateService from "./CertificateService";
import InBrowserProvider from "./InBrowserProvider";

new App(
  browser.webRequest.onHeadersReceived,
  browser.runtime.onMessage,
  new CertificateService(new InBrowserProvider())
);
