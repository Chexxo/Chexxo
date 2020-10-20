import App from "./App";

new App(browser.webRequest.onHeadersReceived, browser.runtime.onMessage);
