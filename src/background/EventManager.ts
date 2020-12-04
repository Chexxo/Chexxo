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
    private webNavigation: WebNavigation.Static,
    private runtime: Runtime.Static,
    private tabs: Tabs.Static,
    private browserAction: BrowserAction.Static,
    private app: App,
    private webRequest?: WebRequest.Static
  ) {}

  init(): void {
    this.webNavigation.onBeforeNavigate.addListener(this.resetTab.bind(this));

    if (this.webRequest) {
      const filter: WebRequest.RequestFilter = {
        urls: ["<all_urls>"],
        types: ["main_frame"],
      };
      const extraInfoSpec: WebRequest.OnHeadersReceivedOptions[] = ["blocking"];
      this.webRequest.onHeadersReceived.addListener(
        this.receiveWebRequestHeaders.bind(this),
        filter,
        extraInfoSpec
      );
    } else {
      this.webNavigation.onCommitted.addListener(
        this.receiveWebRequestHeaders.bind(this)
      );
    }

    this.webNavigation.onErrorOccurred.addListener(
      this.receiveWebRequestError.bind(this)
    );
    this.webNavigation.onCompleted.addListener(
      this.changeBrowserAction.bind(this)
    );
    this.runtime.onMessage.addListener(this.receiveMessage.bind(this));
  }

  isHttps(requestDetails: { url: string; tabId: number }): boolean {
    const url = new URL(requestDetails.url);
    return url.protocol === "https:";
  }

  resetTab(requestDetails: {
    url: string;
    tabId: number;
    parentFrameId: number;
  }): void {
    if (requestDetails.parentFrameId !== -1) {
      return;
    }

    if (this.isHttps(requestDetails)) {
      this.browserAction.enable(requestDetails.tabId);
    } else {
      this.browserAction.disable(requestDetails.tabId);
      this.app.resetTabData(requestDetails.tabId);
    }
  }

  async receiveWebRequestHeaders(requestDetails: {
    url: string;
    tabId: number;
  }): Promise<WebRequest.BlockingResponse> {
    /*
      has to be asserted twice, because 'webextension-polyfill-ts' has declared 
      OnCommittedDetailsType incorrectly
    */
    const fixedDetails = (requestDetails as unknown) as {
      url: string;
      tabId: number;
      parentFrameId: number;
    };

    if (fixedDetails.parentFrameId !== -1) {
      return {};
    }
    if (!this.isHttps(fixedDetails)) {
      return {};
    }

    this.app.resetTabData(fixedDetails.tabId);

    const hasQualityDecreased = await this.app.fetchCertificate(fixedDetails);
    if (hasQualityDecreased) {
      const path = `blocked.html?url=${fixedDetails.url}`;
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
      has to be asserted twice, because 'webextension-polyfill-ts' has declared 
      OnErrorOccuredDetailsType incorrectly
    */
    const fixedDetails = (requestDetails as unknown) as {
      tabId: number;
      frameId: number;
      error: string;
    };

    if (requestDetails.frameId !== 0) {
      return;
    }
    if (!this.isHttps(requestDetails)) {
      return;
    }

    this.app.analyzeError(fixedDetails);
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

  changeBrowserAction(requestDetails: { tabId: number }): void {
    const { tabId } = requestDetails;
    const errorMessage = this.app.getErrorMessage(tabId);
    if (errorMessage) {
      this.browserAction.setIcon({ tabId, path: "../assets/logo_error.svg" });
      this.browserAction.setBadgeBackgroundColor({ tabId, color: "#d32f2f" });
      this.browserAction.setBadgeText({ tabId, text: "!" });
    } else {
      this.browserAction.setIcon({ tabId, path: "../assets/logo.svg" });
      this.browserAction.setBadgeBackgroundColor({ tabId, color: "#1976d2" });

      const quality = this.app.getQuality(tabId);
      if (quality) {
        const stars = "*".repeat(quality.level);
        this.browserAction.setBadgeText({ tabId, text: stars });
      } else {
        this.browserAction.setBadgeText({ tabId, text: "" });
      }
    }
  }
}
