import {
  BrowserAction,
  Runtime,
  Tabs,
  WebNavigation,
  WebRequest,
} from "webextension-polyfill-ts";
import { UnhandledMessageError } from "../types/errors/UnhandledMessageError";

import { App } from "./App";

export class EventManager {
  constructor(
    private webRequest: WebRequest.Static,
    private webNavigation: WebNavigation.Static,
    private runtime: Runtime.Static,
    private tabs: Tabs.Static,
    private browserAction: BrowserAction.Static,
    private app: App
  ) {}

  init(): void {
    const filter: WebRequest.RequestFilter = {
      urls: ["<all_urls>"],
      types: ["main_frame"],
    };
    const extraInfoSpec: WebRequest.OnHeadersReceivedOptions[] = ["blocking"];

    this.webRequest.onBeforeRequest.addListener(
      this.resetTabData.bind(this),
      filter,
      []
    );
    this.webRequest.onHeadersReceived.addListener(
      this.receiveWebRequestHeaders.bind(this),
      filter,
      extraInfoSpec
    );
    this.webNavigation.onErrorOccurred.addListener(
      this.receiveWebRequestError.bind(this)
    );
    this.runtime.onMessage.addListener(this.receiveMessage.bind(this));
    this.tabs.onActivated.addListener(this.changeBrowserAction.bind(this));
  }

  resetTabData(requestDetails: { tabId: number }): void {
    this.app.resetTabData(requestDetails.tabId);
  }

  async receiveWebRequestHeaders(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): Promise<WebRequest.BlockingResponse> {
    const hasQualityDecreased = await this.app.fetchCertificate(requestDetails);
    this.changeBrowserAction(requestDetails);

    if (hasQualityDecreased) {
      const path = `blocked.html?url=${requestDetails.url}`;
      this.tabs.create({ url: this.runtime.getURL(path) });
      return { cancel: true };
    } else {
      return {};
    }
  }

  receiveWebRequestError(
    requestDetails: WebNavigation.OnErrorOccurredDetailsType
  ): void {
    /*
      has to asserted twice, because 'webextension-polyfill-ts' has declared 
      OnErrorOccuredDetailsType incorrectly
    */
    const fixedDetails = (requestDetails as unknown) as {
      tabId: number;
      frameId: number;
      error: string;
    };

    this.app.analyzeError(fixedDetails);
    this.changeBrowserAction(fixedDetails);
  }

  receiveMessage(message: { type: string; params: unknown }): Promise<unknown> {
    return new Promise((resolve, reject) => {
      let params;
      switch (message.type) {
        case "getCertificate":
          params = message.params as { tabId: number };
          const certificate = this.app.getCertificate(params.tabId);
          resolve(certificate);
          break;
        case "getQuality":
          params = message.params as { tabId: number };
          const quality = this.app.getQuality(params.tabId);
          resolve(quality);
          break;
        case "getErrorMessage":
          params = message.params as { tabId: number };
          const errorMessage = this.app.getErrorMessage(params.tabId);
          resolve(errorMessage);
          break;
        case "resetQuality":
          params = message.params as { url: string };
          this.app.resetQuality(params.url);
          resolve(true);
        default:
          reject(new UnhandledMessageError(JSON.stringify(message)));
      }
    });
  }

  changeBrowserAction(tabInfo: { tabId: number }): void {
    const { tabId } = tabInfo;
    if (this.app.getErrorMessage(tabId)) {
      this.browserAction.setIcon({ path: "../assets/logo_error.svg" });
      this.browserAction.setBadgeBackgroundColor({ color: "#d32f2f" });
      this.browserAction.setBadgeText({ text: "!" });
    } else {
      this.browserAction.setIcon({ path: "../assets/logo.svg" });
      this.browserAction.setBadgeBackgroundColor({ color: "#1976d2" });

      const quality = this.app.getQuality(tabId);
      if (quality) {
        const stars = "*".repeat(quality.level);
        this.browserAction.setBadgeText({ text: stars });
      } else {
        this.browserAction.setBadgeText({ text: "" });
      }
    }
  }
}
