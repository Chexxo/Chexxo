import { browser } from "webextension-polyfill-ts";

import App from "./App";

new App(browser.webRequest.onHeadersReceived, browser.runtime.onMessage);
