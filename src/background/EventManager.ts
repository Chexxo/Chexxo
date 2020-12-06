import {
  BrowserAction,
  Runtime,
  Tabs,
  WebNavigation,
  WebRequest,
} from "webextension-polyfill-ts";

import { Configuration } from "../types/Configuration";
import { StorageError } from "../types/errors/StorageError";
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
      this.receiveWebNavigationError.bind(this)
    );
    this.webNavigation.onCompleted.addListener(
      this.changeBrowserAction.bind(this)
    );
    this.runtime.onMessage.addListener(this.receiveMessage.bind(this));
  }

  isHttps(url: string): boolean {
    const realUrl = new URL(url);
    return realUrl.protocol === "https:";
  }

  resetTab(requestDetails: {
    url: string;
    tabId: number;
    parentFrameId: number;
  }): void {
    if (requestDetails.parentFrameId !== -1) {
      return;
    }

    if (!this.isHttps(requestDetails.url)) {
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

    if (!this.isHttps(fixedDetails.url)) {
      return {};
    }

    await this.app.fetchCertificate(requestDetails);
    const hasQualityDecreased = await this.app.analyzeQuality(requestDetails);

    if (hasQualityDecreased) {
      const path = `blocked.html?url=${requestDetails.url}`;
      this.tabs.update(requestDetails.tabId, {
        url: this.runtime.getURL(path),
      });
      return { cancel: true };
    } else {
      return {};
    }
  }

  public receiveWebNavigationError(
    requestDetails: WebNavigation.OnErrorOccurredDetailsType
  ): void {
    /*
      has to be asserted twice, because 'webextension-polyfill-ts' has declared 
      OnErrorOccuredDetailsType incorrectly
    */
    const fixedDetails = (requestDetails as unknown) as {
      url: string;
      tabId: number;
      frameId: number;
      error: string;
    };

    if (requestDetails.frameId !== 0) {
      return;
    }
    if (!this.isHttps(requestDetails.url)) {
      return;
    }

    this.app.analyzeError(fixedDetails);
    this.changeBrowserAction(requestDetails);
  }

  receiveMessage(message: {
    type: string;
    params?: unknown;
  }): Promise<unknown> {
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
          resolve();
          break;
        case "getConfiguration":
          try {
            const configuration = this.app.getConfiguration();
            resolve(configuration);
          } catch (error) {
            reject(error as StorageError);
          }
          break;
        case "setConfiguration":
          params = message.params as { configuration: Configuration };
          try {
            this.app.setConfiguration(params.configuration);
            resolve();
          } catch (error) {
            reject(error as Error);
          }
          break;
        case "removeCache":
          resolve(this.app.removeCache());
          break;
        case "exportLogs":
          try {
            resolve(this.app.exportLogs());
          } catch (error) {
            reject(error as Error);
          }
          break;
        case "removeLogs":
          try {
            resolve(this.app.removeLogs());
          } catch (error) {
            reject(error as Error);
          }
          break;
        default:
          reject(new UnhandledMessageError(JSON.stringify(message)));
      }
    });
  }

  changeBrowserAction(requestDetails: { url: string; tabId: number }): void {
    const { url, tabId } = requestDetails;
    const { parentFrameId } = (requestDetails as unknown) as {
      parentFrameId: number;
    };

    if (parentFrameId !== -1) {
      return;
    }

    if (!this.isHttps(url)) {
      this.browserAction.setIcon({ tabId, path: "../assets/logo.svg" });
      this.browserAction.setBadgeBackgroundColor({ tabId, color: "#1976d2" });
      this.browserAction.disable(tabId);
      return;
    } else {
      this.browserAction.enable(tabId);
    }

    if (this.app.getErrorMessage(tabId)) {
      this.browserAction.setIcon({
        tabId,
        path: "../assets/logo_error.svg",
      });
      this.browserAction.setBadgeBackgroundColor({
        tabId,
        color: "#d32f2f",
      });
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
